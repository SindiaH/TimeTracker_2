import { InjectionToken } from '@angular/core';
import { AddFolderCommand, FolderEntity, UpdateFolderCommand } from '@database/entities/folder.entity';
import { FolderReadModel } from '@database/read-models/folder-read-model';

export type FolderListFilter = {
  archivedOnly: boolean;
};

export interface IFolderService {
  list(filter: FolderListFilter): Promise<FolderReadModel[]>;
  getById(id: string): Promise<FolderReadModel | null>;
  add(command: AddFolderCommand): Promise<FolderEntity>;
  update(command: UpdateFolderCommand): Promise<FolderEntity>;
  remove(id: string): Promise<void>;
}

export const FOLDER_SERVICE_TOKEN = new InjectionToken<IFolderService>('FOLDER_SERVICE_TOKEN');
