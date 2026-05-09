import { inject, Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { SessionProvider } from '@core/providers/session.provider';
import { NotificationService } from '@core/services/notification/notification.service';
import { AddTaskCommand, UpdateTaskCommand } from '@database/entities/task.entity';
import { TaskReadModel } from '@database/read-models/task-read-model';
import { ITaskService, TASK_SERVICE_TOKEN, TaskListFilter } from '@database/services/interfaces/task-service.interface';

const DEFAULT_FILTER: TaskListFilter = { archivedOnly: false };

@Injectable({ providedIn: 'root' })
export class TaskProvider extends ServiceBase {
  private readonly taskService: ITaskService = inject(TASK_SERVICE_TOKEN);
  private readonly sessionProvider = inject(SessionProvider);
  private readonly notificationService = inject(NotificationService);

  private readonly _taskList = signal<TaskReadModel[]>([]);
  private readonly _filter = signal<TaskListFilter>(DEFAULT_FILTER);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isAdding = signal<boolean>(false);
  private readonly _isUpdating = signal<boolean>(false);
  private readonly _isDeleting = signal<boolean>(false);
  private readonly _isInitialized = signal<boolean>(false);

  readonly taskList: Signal<TaskReadModel[]> = this._taskList.asReadonly();
  readonly filter: Signal<TaskListFilter> = this._filter.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isAdding: Signal<boolean> = this._isAdding.asReadonly();
  readonly isUpdating: Signal<boolean> = this._isUpdating.asReadonly();
  readonly isDeleting: Signal<boolean> = this._isDeleting.asReadonly();
  readonly isInitialized: Signal<boolean> = this._isInitialized.asReadonly();

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

  async refresh(): Promise<boolean> {
    this._isLoading.set(true);
    try {
      const list = await this.taskService.list(this._filter());
      this._taskList.set(list);
      this._isInitialized.set(true);
      return true;
    } catch {
      this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.loadFailed);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  async setFilter(filter: TaskListFilter): Promise<boolean> {
    this._filter.set(filter);
    return this.refresh();
  }

  async addTask(command: AddTaskCommand): Promise<TaskReadModel | null> {
    this._isAdding.set(true);
    try {
      const created = await this.taskService.add(command);
      if (!created.id) {
        this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.saveFailed);
        return null;
      }
      const enriched = (await this.taskService.getById(created.id)) ?? this.toReadModel(created);
      this._taskList.update((list) => [...list, enriched]);
      return enriched;
    } catch {
      this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.saveFailed);
      return null;
    } finally {
      this._isAdding.set(false);
    }
  }

  async updateTask(command: UpdateTaskCommand): Promise<TaskReadModel | null> {
    this._isUpdating.set(true);
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
        this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.saveFailed);
        return null;
      }
      return refreshed;
    } catch {
      this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.saveFailed);
      return null;
    } finally {
      this._isUpdating.set(false);
    }
  }

  async archiveTask(id: string, archive: boolean): Promise<boolean> {
    const updated = await this.updateTask({ id, isArchived: archive });
    if (updated === null) return false;
    if (archive !== this._filter().archivedOnly) {
      this._taskList.update((list) => list.filter((task) => task.id !== id));
    }
    return true;
  }

  async removeTask(id: string): Promise<boolean> {
    this._isDeleting.set(true);
    try {
      await this.taskService.remove(id);
      this._taskList.update((list) => list.filter((task) => task.id !== id));
      return true;
    } catch {
      this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.deleteFailed);
      return false;
    } finally {
      this._isDeleting.set(false);
    }
  }

  private toReadModel(entity: TaskReadModel | { id?: string; name: string }): TaskReadModel {
    const model = new TaskReadModel();
    Object.assign(model, entity);
    return model;
  }
}
