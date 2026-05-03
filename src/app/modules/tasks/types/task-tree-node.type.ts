import { FolderReadModel } from '@database/read-models/folder-read-model';
import { TaskReadModel } from '@database/read-models/task-read-model';

export type TaskTreeNodeKind = 'folder' | 'task';

export type TaskTreeNode = {
  id: string;
  kind: TaskTreeNodeKind;
  name: string;
  color?: string;
  parentColor?: string;
  parentFolderId?: string;
  duration: number;
  isArchived: boolean;
  depth: number;
  children: TaskTreeNode[];
  source: FolderReadModel | TaskReadModel;
};
