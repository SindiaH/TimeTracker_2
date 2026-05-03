import { BaseEntity } from '@database/entities/base.entity';

export class FolderEntity extends BaseEntity {
  name = '';
  parentFolderId?: string;
  color?: string;
  order?: number;
  isArchived = false;
}

export type AddFolderCommand = {
  name: string;
  parentFolderId?: string;
  color?: string;
  order?: number;
};

export type UpdateFolderCommand = {
  id: string;
  name?: string;
  parentFolderId?: string | null;
  color?: string | null;
  order?: number;
  isArchived?: boolean;
};
