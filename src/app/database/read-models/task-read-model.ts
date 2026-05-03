import { TaskEntity } from '@database/entities/task.entity';

export class TaskReadModel extends TaskEntity {
  childCount = 0;
  parentName?: string;
  fullParentName?: string;
  parentColor?: string;
  duration = 0;
}
