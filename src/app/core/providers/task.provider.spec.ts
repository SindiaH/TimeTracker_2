import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { SessionProvider } from '@core/providers/session.provider';
import { TaskProvider } from '@core/providers/task.provider';
import { NotificationService } from '@core/services/notification/notification.service';
import { TaskEntity } from '@database/entities/task.entity';
import { TaskReadModel } from '@database/read-models/task-read-model';
import { ITaskService, TASK_SERVICE_TOKEN } from '@database/services/interfaces/task-service.interface';
import { NotificationServiceStub } from '@testing/stubs/notification-service.stub';

const buildReadModel = (overrides: Partial<TaskReadModel> = {}): TaskReadModel => {
  const model = new TaskReadModel();
  model.id = overrides.id ?? 'task-1';
  model.name = overrides.name ?? 'Task 1';
  model.parentFolderId = overrides.parentFolderId;
  model.color = overrides.color;
  model.duration = overrides.duration ?? 0;
  model.isArchived = overrides.isArchived ?? false;
  model.childCount = overrides.childCount ?? 0;
  return model;
};

describe('TaskProvider', () => {
  let isAuthenticated$: Subject<boolean>;
  let taskService: ITaskService;
  let notificationService: NotificationServiceStub;

  beforeEach(() => {
    isAuthenticated$ = new Subject<boolean>();
    notificationService = new NotificationServiceStub();
    taskService = {
      list: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      add: vi.fn().mockImplementation((command: { name: string }) => {
        const entity = new TaskEntity();
        entity.id = 'new-task';
        entity.name = command.name;
        return Promise.resolve(entity);
      }),
      update: vi.fn().mockImplementation((command: { id: string }) => {
        const entity = new TaskEntity();
        entity.id = command.id;
        return Promise.resolve(entity);
      }),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TASK_SERVICE_TOKEN, useValue: taskService },
        {
          provide: SessionProvider,
          useValue: { isAuthenticated$: isAuthenticated$.asObservable() },
        },
        { provide: NotificationService, useValue: notificationService },
        TaskProvider,
      ],
    });
  });

  it('starts empty before authentication', () => {
    const provider = TestBed.inject(TaskProvider);

    expect(provider.taskList()).toEqual([]);
    expect(provider.isInitialized()).toBe(false);
  });

  it('refreshes the list when the user is authenticated', async () => {
    const tasks = [buildReadModel({ id: 'a' }), buildReadModel({ id: 'b', name: 'Task 2' })];
    (taskService.list as ReturnType<typeof vi.fn>).mockResolvedValue(tasks);

    const provider = TestBed.inject(TaskProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(taskService.list).toHaveBeenCalledWith({ archivedOnly: false });
    expect(provider.taskList()).toEqual(tasks);
    expect(provider.isInitialized()).toBe(true);
  });

  it('clears state on sign-out', async () => {
    (taskService.list as ReturnType<typeof vi.fn>).mockResolvedValue([buildReadModel()]);
    const provider = TestBed.inject(TaskProvider);

    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(provider.taskList().length).toBe(1);

    isAuthenticated$.next(false);
    expect(provider.taskList()).toEqual([]);
    expect(provider.isInitialized()).toBe(false);
  });

  it('appends a task after add', async () => {
    const stored = buildReadModel({ id: 'new-task', name: 'Brand new' });
    (taskService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(stored);

    const provider = TestBed.inject(TaskProvider);
    const created = await provider.addTask({ name: 'Brand new' });

    expect(created).toBe(stored);
    expect(provider.taskList()).toEqual([stored]);
    expect(taskService.add).toHaveBeenCalledWith({ name: 'Brand new' });
    expect(taskService.getById).toHaveBeenCalledWith('new-task');
  });

  it('removes archived tasks from the list when filter excludes them', async () => {
    const stored = buildReadModel({ id: 't1', name: 'Existing' });
    (taskService.list as ReturnType<typeof vi.fn>).mockResolvedValue([stored]);
    const provider = TestBed.inject(TaskProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    const archived = buildReadModel({ id: 't1', isArchived: true });
    (taskService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(archived);

    await provider.archiveTask('t1', true);

    expect(taskService.update).toHaveBeenCalledWith({ id: 't1', isArchived: true });
    expect(provider.taskList().some((task) => task.id === 't1')).toBe(false);
  });

  it('removes a task on remove', async () => {
    const provider = TestBed.inject(TaskProvider);
    const stored = buildReadModel({ id: 'new-task' });
    (taskService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(stored);
    await provider.addTask({ name: 'tmp' });
    await provider.removeTask('new-task');

    expect(taskService.remove).toHaveBeenCalledWith('new-task');
    expect(provider.taskList()).toEqual([]);
  });

  it('shows a load-failed toast on refresh failure without throwing', async () => {
    (taskService.list as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('boom'));
    const provider = TestBed.inject(TaskProvider);

    const result = await provider.refresh();

    expect(result).toBe(false);
    expect(provider.isLoading()).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.tasks.feedback.loadFailed }]);
  });

  it('shows a save-failed toast when add rejects without throwing', async () => {
    (taskService.add as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('add boom'));
    const provider = TestBed.inject(TaskProvider);

    const result = await provider.addTask({ name: 'tmp' });

    expect(result).toBeNull();
    expect(provider.isAdding()).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.tasks.feedback.saveFailed }]);
  });

  it('shows a delete-failed toast when remove rejects without throwing', async () => {
    (taskService.remove as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('rm boom'));
    const provider = TestBed.inject(TaskProvider);

    const result = await provider.removeTask('t1');

    expect(result).toBe(false);
    expect(provider.isDeleting()).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.tasks.feedback.deleteFailed }]);
  });

  it('exposes isAdding only during add and clears it afterwards', async () => {
    const stored = buildReadModel({ id: 'new-task' });
    (taskService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(stored);
    const provider = TestBed.inject(TaskProvider);

    expect(provider.isAdding()).toBe(false);

    const inFlight = provider.addTask({ name: 'tmp' });
    expect(provider.isAdding()).toBe(true);
    expect(provider.isUpdating()).toBe(false);
    expect(provider.isDeleting()).toBe(false);

    await inFlight;
    expect(provider.isAdding()).toBe(false);
  });

  it('exposes isUpdating only during update and clears it afterwards', async () => {
    const stored = buildReadModel({ id: 't1' });
    (taskService.list as ReturnType<typeof vi.fn>).mockResolvedValue([stored]);
    (taskService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(stored);
    const provider = TestBed.inject(TaskProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    const inFlight = provider.updateTask({ id: 't1', name: 'renamed' });
    expect(provider.isUpdating()).toBe(true);
    expect(provider.isAdding()).toBe(false);
    expect(provider.isDeleting()).toBe(false);

    await inFlight;
    expect(provider.isUpdating()).toBe(false);
  });

  it('exposes isDeleting only during remove and clears it afterwards', async () => {
    const stored = buildReadModel({ id: 't1' });
    (taskService.list as ReturnType<typeof vi.fn>).mockResolvedValue([stored]);
    const provider = TestBed.inject(TaskProvider);
    isAuthenticated$.next(true);
    await Promise.resolve();
    await Promise.resolve();

    const inFlight = provider.removeTask('t1');
    expect(provider.isDeleting()).toBe(true);
    expect(provider.isAdding()).toBe(false);
    expect(provider.isUpdating()).toBe(false);

    await inFlight;
    expect(provider.isDeleting()).toBe(false);
  });
});
