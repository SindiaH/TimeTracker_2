import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { SessionProvider } from '@core/providers/session.provider';
import { AddTaskCommand, UpdateTaskCommand } from '@database/entities/task.entity';
import { TaskReadModel } from '@database/read-models/task-read-model';
import { ITaskService, TASK_SERVICE_TOKEN, TaskListFilter } from '@database/services/interfaces/task-service.interface';

const DEFAULT_FILTER: TaskListFilter = { archivedOnly: false };

@Injectable({ providedIn: 'root' })
export class TaskProvider extends ServiceBase {
  private readonly taskService: ITaskService = inject(TASK_SERVICE_TOKEN);
  private readonly sessionProvider = inject(SessionProvider);

  private readonly _taskList = signal<TaskReadModel[]>([]);
  private readonly _filter = signal<TaskListFilter>(DEFAULT_FILTER);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isInitialized = signal<boolean>(false);
  private readonly _lastError = signal<Error | null>(null);

  readonly taskList: Signal<TaskReadModel[]> = this._taskList.asReadonly();
  readonly filter: Signal<TaskListFilter> = this._filter.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isInitialized: Signal<boolean> = this._isInitialized.asReadonly();
  readonly lastError: Signal<Error | null> = this._lastError.asReadonly();

  readonly tasksByFolderId: Signal<Map<string | null, TaskReadModel[]>> = computed<Map<string | null, TaskReadModel[]>>(
    () => {
      const tasks = this._taskList();
      const grouped = new Map<string | null, TaskReadModel[]>();
      for (const task of tasks) {
        const key = task.parentFolderId ?? null;
        const bucket = grouped.get(key);
        if (bucket === undefined) {
          grouped.set(key, [task]);
        } else {
          bucket.push(task);
        }
      }
      return grouped;
    },
  );

  constructor() {
    super();
    this.sessionProvider.isAuthenticated$.pipe(this.takeUntilDestroyed()).subscribe((authed) => {
      if (authed) {
        void this.refresh();
      } else {
        this._taskList.set([]);
        this._isInitialized.set(false);
      }
    });
  }

  async refresh(): Promise<void> {
    this._isLoading.set(true);
    this._lastError.set(null);
    try {
      const list = await this.taskService.list(this._filter());
      this._taskList.set(list);
      this._isInitialized.set(true);
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async setFilter(filter: TaskListFilter): Promise<void> {
    this._filter.set(filter);
    await this.refresh();
  }

  async addTask(command: AddTaskCommand): Promise<TaskReadModel> {
    this._lastError.set(null);
    try {
      const created = await this.taskService.add(command);
      if (!created.id) {
        throw new Error('Created task is missing an id');
      }
      const enriched = (await this.taskService.getById(created.id)) ?? this.toReadModel(created);
      this._taskList.update((list) => [...list, enriched]);
      return enriched;
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    }
  }

  async updateTask(command: UpdateTaskCommand): Promise<TaskReadModel> {
    this._lastError.set(null);
    try {
      await this.taskService.update(command);
      const refreshed = await this.taskService.getById(command.id);
      this._taskList.update((list) => {
        if (refreshed === null) {
          return list.filter((task) => task.id !== command.id);
        }
        const exists = list.some((task) => task.id === command.id);
        return exists ? list.map((task) => (task.id === command.id ? refreshed : task)) : [...list, refreshed];
      });
      if (refreshed === null) {
        throw new Error('Task disappeared after update');
      }
      return refreshed;
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    }
  }

  async archiveTask(id: string, archive: boolean): Promise<void> {
    await this.updateTask({ id, isArchived: archive });
    if (archive !== this._filter().archivedOnly) {
      this._taskList.update((list) => list.filter((task) => task.id !== id));
    }
  }

  async removeTask(id: string): Promise<void> {
    this._lastError.set(null);
    try {
      await this.taskService.remove(id);
      this._taskList.update((list) => list.filter((task) => task.id !== id));
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    }
  }

  private toReadModel(entity: TaskReadModel | { id?: string; name: string }): TaskReadModel {
    const model = new TaskReadModel();
    Object.assign(model, entity);
    return model;
  }

  private toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}
