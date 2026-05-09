import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { FolderProvider } from '@core/providers/folder.provider';
import { SessionProvider } from '@core/providers/session.provider';
import { NotificationService } from '@core/services/notification/notification.service';
import { FolderEntity } from '@database/entities/folder.entity';
import { FolderReadModel } from '@database/read-models/folder-read-model';
import { FOLDER_SERVICE_TOKEN, IFolderService } from '@database/services/interfaces/folder-service.interface';
import { NotificationServiceStub } from '@testing/stubs/notification-service.stub';

const buildReadModel = (overrides: Partial<FolderReadModel> = {}): FolderReadModel => {
  const model = new FolderReadModel();
  model.id = overrides.id ?? 'folder-1';
  model.name = overrides.name ?? 'Folder 1';
  model.parentFolderId = overrides.parentFolderId;
  model.color = overrides.color;
  model.duration = overrides.duration ?? 0;
  model.isArchived = overrides.isArchived ?? false;
  model.childCount = overrides.childCount ?? 0;
  return model;
};

describe('FolderProvider', () => {
  let isAuthenticated$: Subject<boolean>;
  let folderService: IFolderService;
  let notificationService: NotificationServiceStub;

  beforeEach(() => {
    isAuthenticated$ = new Subject<boolean>();
    notificationService = new NotificationServiceStub();
    folderService = {
      list: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      add: vi.fn().mockImplementation((command: { name: string }) => {
        const entity = new FolderEntity();
        entity.id = 'new-folder';
        entity.name = command.name;
        return Promise.resolve(entity);
      }),
      update: vi.fn().mockImplementation((command: { id: string }) => {
        const entity = new FolderEntity();
        entity.id = command.id;
        return Promise.resolve(entity);
      }),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: FOLDER_SERVICE_TOKEN, useValue: folderService },
        {
          provide: SessionProvider,
          useValue: { isAuthenticated$: isAuthenticated$.asObservable() },
        },
        { provide: NotificationService, useValue: notificationService },
        FolderProvider,
      ],
    });
  });

  it('groups folders by parent folder id', async () => {
    const root = buildReadModel({ id: 'root' });
    const child = buildReadModel({ id: 'child', parentFolderId: 'root' });
    (folderService.list as ReturnType<typeof vi.fn>).mockResolvedValue([root, child]);

    const provider = TestBed.inject(FolderProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    const grouped = provider.foldersByParentId();
    expect(grouped.get(null)).toEqual([root]);
    expect(grouped.get('root')).toEqual([child]);
  });

  it('appends a folder after add', async () => {
    const stored = buildReadModel({ id: 'new-folder', name: 'Brand new' });
    (folderService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(stored);

    const provider = TestBed.inject(FolderProvider);
    const created = await provider.addFolder({ name: 'Brand new' });

    expect(created).toBe(stored);
    expect(provider.folderList()).toEqual([stored]);
  });

  it('removes a folder on remove', async () => {
    (folderService.list as ReturnType<typeof vi.fn>).mockResolvedValue([buildReadModel({ id: 'f1' })]);
    const provider = TestBed.inject(FolderProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    await provider.removeFolder('f1');

    expect(folderService.remove).toHaveBeenCalledWith('f1');
    expect(provider.folderList()).toEqual([]);
  });

  it('shows a load-failed toast on refresh failure without throwing', async () => {
    (folderService.list as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('boom'));
    const provider = TestBed.inject(FolderProvider);

    const result = await provider.refresh();

    expect(result).toBe(false);
    expect(provider.isLoading()).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.tasks.feedback.loadFailed }]);
  });

  it('shows a save-failed toast when add rejects without throwing', async () => {
    (folderService.add as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('add boom'));
    const provider = TestBed.inject(FolderProvider);

    const result = await provider.addFolder({ name: 'tmp' });

    expect(result).toBeNull();
    expect(provider.isAdding()).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.tasks.feedback.saveFailed }]);
  });

  it('shows a delete-failed toast when remove rejects without throwing', async () => {
    (folderService.list as ReturnType<typeof vi.fn>).mockResolvedValue([buildReadModel({ id: 'f1' })]);
    (folderService.remove as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('rm boom'));
    const provider = TestBed.inject(FolderProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    const result = await provider.removeFolder('f1');

    expect(result).toBe(false);
    expect(provider.isDeleting()).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.tasks.feedback.deleteFailed }]);
  });

  it('exposes isAdding only during add and clears it afterwards', async () => {
    const stored = buildReadModel({ id: 'new-folder' });
    (folderService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(stored);
    const provider = TestBed.inject(FolderProvider);

    expect(provider.isAdding()).toBe(false);

    const inFlight = provider.addFolder({ name: 'tmp' });
    expect(provider.isAdding()).toBe(true);
    expect(provider.isUpdating()).toBe(false);
    expect(provider.isDeleting()).toBe(false);

    await inFlight;
    expect(provider.isAdding()).toBe(false);
  });

  it('exposes isUpdating only during update and clears it afterwards', async () => {
    const stored = buildReadModel({ id: 'f1' });
    (folderService.list as ReturnType<typeof vi.fn>).mockResolvedValue([stored]);
    (folderService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(stored);
    const provider = TestBed.inject(FolderProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    const inFlight = provider.updateFolder({ id: 'f1', name: 'renamed' });
    expect(provider.isUpdating()).toBe(true);
    expect(provider.isAdding()).toBe(false);
    expect(provider.isDeleting()).toBe(false);

    await inFlight;
    expect(provider.isUpdating()).toBe(false);
  });

  it('exposes isDeleting only during remove and clears it afterwards', async () => {
    const stored = buildReadModel({ id: 'f1' });
    (folderService.list as ReturnType<typeof vi.fn>).mockResolvedValue([stored]);
    const provider = TestBed.inject(FolderProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    const inFlight = provider.removeFolder('f1');
    expect(provider.isDeleting()).toBe(true);
    expect(provider.isAdding()).toBe(false);
    expect(provider.isUpdating()).toBe(false);

    await inFlight;
    expect(provider.isDeleting()).toBe(false);
  });
});
