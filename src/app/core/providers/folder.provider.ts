import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { SessionProvider } from '@core/providers/session.provider';
import { NotificationService } from '@core/services/notification/notification.service';
import { AddFolderCommand, UpdateFolderCommand } from '@database/entities/folder.entity';
import { FolderReadModel } from '@database/read-models/folder-read-model';
import {
  FOLDER_SERVICE_TOKEN,
  FolderListFilter,
  IFolderService,
} from '@database/services/interfaces/folder-service.interface';

const DEFAULT_FILTER: FolderListFilter = { archivedOnly: false };

@Injectable({ providedIn: 'root' })
export class FolderProvider extends ServiceBase {
  private readonly folderService: IFolderService = inject(FOLDER_SERVICE_TOKEN);
  private readonly sessionProvider = inject(SessionProvider);
  private readonly notificationService = inject(NotificationService);

  private readonly _folderList = signal<FolderReadModel[]>([]);
  private readonly _filter = signal<FolderListFilter>(DEFAULT_FILTER);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isAdding = signal<boolean>(false);
  private readonly _isUpdating = signal<boolean>(false);
  private readonly _isDeleting = signal<boolean>(false);
  private readonly _isInitialized = signal<boolean>(false);

  readonly folderList: Signal<FolderReadModel[]> = this._folderList.asReadonly();
  readonly filter: Signal<FolderListFilter> = this._filter.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isAdding: Signal<boolean> = this._isAdding.asReadonly();
  readonly isUpdating: Signal<boolean> = this._isUpdating.asReadonly();
  readonly isDeleting: Signal<boolean> = this._isDeleting.asReadonly();
  readonly isInitialized: Signal<boolean> = this._isInitialized.asReadonly();

  readonly foldersByParentId: Signal<Map<string | null, FolderReadModel[]>> = computed<
    Map<string | null, FolderReadModel[]>
  >(() => {
    const folders = this._folderList();
    const grouped = new Map<string | null, FolderReadModel[]>();
    for (const folder of folders) {
      const key = folder.parentFolderId ?? null;
      const bucket = grouped.get(key);
      if (bucket === undefined) {
        grouped.set(key, [folder]);
      } else {
        bucket.push(folder);
      }
    }
    return grouped;
  });

  constructor() {
    super();
    this.sessionProvider.isAuthenticated$.pipe(this.takeUntilDestroyed()).subscribe((authed) => {
      if (authed) {
        void this.refresh();
      } else {
        this._folderList.set([]);
        this._isInitialized.set(false);
      }
    });
  }

  async refresh(): Promise<boolean> {
    this._isLoading.set(true);
    try {
      const list = await this.folderService.list(this._filter());
      this._folderList.set(list);
      this._isInitialized.set(true);
      return true;
    } catch {
      this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.loadFailed);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  async setFilter(filter: FolderListFilter): Promise<boolean> {
    this._filter.set(filter);
    return this.refresh();
  }

  async addFolder(command: AddFolderCommand): Promise<FolderReadModel | null> {
    this._isAdding.set(true);
    try {
      const created = await this.folderService.add(command);
      if (!created.id) {
        this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.saveFailed);
        return null;
      }
      const enriched = (await this.folderService.getById(created.id)) ?? this.toReadModel(created);
      this._folderList.update((list) => [...list, enriched]);
      return enriched;
    } catch {
      this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.saveFailed);
      return null;
    } finally {
      this._isAdding.set(false);
    }
  }

  async updateFolder(command: UpdateFolderCommand): Promise<FolderReadModel | null> {
    this._isUpdating.set(true);
    try {
      await this.folderService.update(command);
      const refreshed = await this.folderService.getById(command.id);
      this._folderList.update((list) => {
        if (refreshed === null) {
          return list.filter((folder) => folder.id !== command.id);
        }
        const exists = list.some((folder) => folder.id === command.id);
        return exists ? list.map((folder) => (folder.id === command.id ? refreshed : folder)) : [...list, refreshed];
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

  async archiveFolder(id: string, archive: boolean): Promise<boolean> {
    const updated = await this.updateFolder({ id, isArchived: archive });
    if (updated === null) return false;
    if (archive !== this._filter().archivedOnly) {
      this._folderList.update((list) => list.filter((folder) => folder.id !== id));
    }
    return true;
  }

  async removeFolder(id: string): Promise<boolean> {
    this._isDeleting.set(true);
    try {
      await this.folderService.remove(id);
      this._folderList.update((list) => list.filter((folder) => folder.id !== id));
      return true;
    } catch {
      this.notificationService.showError(TRANSLATION_KEYS.tasks.feedback.deleteFailed);
      return false;
    } finally {
      this._isDeleting.set(false);
    }
  }

  private toReadModel(entity: FolderReadModel | { id?: string; name: string }): FolderReadModel {
    const model = new FolderReadModel();
    Object.assign(model, entity);
    return model;
  }
}
