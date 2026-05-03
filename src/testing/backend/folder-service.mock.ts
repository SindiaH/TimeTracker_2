import { IFolderService } from '@database/services/interfaces/folder-service.interface';

export const createFolderServiceMockShape = (): IFolderService => ({
  list: () => Promise.resolve([]),
  getById: () => Promise.resolve(null),
  add: () => Promise.reject(new Error('not implemented in mock')),
  update: () => Promise.reject(new Error('not implemented in mock')),
  remove: () => Promise.resolve(),
});
