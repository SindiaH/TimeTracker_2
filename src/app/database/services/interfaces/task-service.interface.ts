import { InjectionToken } from '@angular/core';
import { AddTaskCommand, TaskEntity, UpdateTaskCommand } from '@database/entities/task.entity';
import { TaskReadModel } from '@database/read-models/task-read-model';

export type TaskListFilter = {
  archivedOnly: boolean;
};

export interface ITaskService {
  list(filter: TaskListFilter): Promise<TaskReadModel[]>;
  getById(id: string): Promise<TaskReadModel | null>;
  add(command: AddTaskCommand): Promise<TaskEntity>;
  update(command: UpdateTaskCommand): Promise<TaskEntity>;
  remove(id: string): Promise<void>;
}

export const TASK_SERVICE_TOKEN = new InjectionToken<ITaskService>('TASK_SERVICE_TOKEN');
