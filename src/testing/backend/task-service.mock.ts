import { ITaskService } from '@database/services/interfaces/task-service.interface';

export const createTaskServiceMockShape = (): ITaskService => ({
  list: () => Promise.resolve([]),
  getById: () => Promise.resolve(null),
  add: () => Promise.reject(new Error('not implemented in mock')),
  update: () => Promise.reject(new Error('not implemented in mock')),
  remove: () => Promise.resolve(),
});
