import { BaseEntity } from '@database/entities/base.entity';

export class TaskEntity extends BaseEntity {
  name = '';
  description?: string;
  parentFolderId?: string;
  color?: string;
  order?: number;
  isArchived = false;
}

export type AddTaskCommand = {
  name: string;
  description?: string;
  parentFolderId?: string;
  color?: string;
  order?: number;
};

export type UpdateTaskCommand = {
  id: string;
  name?: string;
  description?: string | null;
  parentFolderId?: string | null;
  color?: string | null;
  order?: number;
  isArchived?: boolean;
};
