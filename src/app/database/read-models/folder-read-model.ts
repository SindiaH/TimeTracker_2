import { FolderEntity } from '@database/entities/folder.entity';

export class FolderReadModel extends FolderEntity {
  childCount = 0;
  duration = 0;
  parentColor?: string;
}
