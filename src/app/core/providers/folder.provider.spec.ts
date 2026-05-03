import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { FolderProvider } from '@core/providers/folder.provider';
import { SessionProvider } from '@core/providers/session.provider';
import { FolderEntity } from '@database/entities/folder.entity';
import { FolderReadModel } from '@database/read-models/folder-read-model';
import { FOLDER_SERVICE_TOKEN, IFolderService } from '@database/services/interfaces/folder-service.interface';

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

  beforeEach(() => {
    isAuthenticated$ = new Subject<boolean>();
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

  it('captures errors on refresh failure', async () => {
    const failure = new Error('boom');
    (folderService.list as ReturnType<typeof vi.fn>).mockRejectedValueOnce(failure);
    const provider = TestBed.inject(FolderProvider);

    await expect(provider.refresh()).rejects.toBe(failure);
    expect(provider.lastError()).toBe(failure);
    expect(provider.isLoading()).toBe(false);
  });
});
