import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { SessionProvider } from '@core/providers/session.provider';
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

  private readonly _folderList = signal<FolderReadModel[]>([]);
  private readonly _filter = signal<FolderListFilter>(DEFAULT_FILTER);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isInitialized = signal<boolean>(false);
  private readonly _lastError = signal<Error | null>(null);

  readonly folderList: Signal<FolderReadModel[]> = this._folderList.asReadonly();
  readonly filter: Signal<FolderListFilter> = this._filter.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isInitialized: Signal<boolean> = this._isInitialized.asReadonly();
  readonly lastError: Signal<Error | null> = this._lastError.asReadonly();

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

  async refresh(): Promise<void> {
    this._isLoading.set(true);
    this._lastError.set(null);
    try {
      const list = await this.folderService.list(this._filter());
      this._folderList.set(list);
      this._isInitialized.set(true);
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async setFilter(filter: FolderListFilter): Promise<void> {
    this._filter.set(filter);
    await this.refresh();
  }

  async addFolder(command: AddFolderCommand): Promise<FolderReadModel> {
    this._lastError.set(null);
    try {
      const created = await this.folderService.add(command);
      if (!created.id) {
        throw new Error('Created folder is missing an id');
      }
      const enriched = (await this.folderService.getById(created.id)) ?? this.toReadModel(created);
      this._folderList.update((list) => [...list, enriched]);
      return enriched;
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    }
  }

  async updateFolder(command: UpdateFolderCommand): Promise<FolderReadModel> {
    this._lastError.set(null);
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
        throw new Error('Folder disappeared after update');
      }
      return refreshed;
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    }
  }

  async archiveFolder(id: string, archive: boolean): Promise<void> {
    await this.updateFolder({ id, isArchived: archive });
    if (archive !== this._filter().archivedOnly) {
      this._folderList.update((list) => list.filter((folder) => folder.id !== id));
    }
  }

  async removeFolder(id: string): Promise<void> {
    this._lastError.set(null);
    try {
      await this.folderService.remove(id);
      this._folderList.update((list) => list.filter((folder) => folder.id !== id));
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    }
  }

  private toReadModel(entity: FolderReadModel | { id?: string; name: string }): FolderReadModel {
    const model = new FolderReadModel();
    Object.assign(model, entity);
    return model;
  }

  private toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}
