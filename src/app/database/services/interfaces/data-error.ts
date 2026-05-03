export type DataErrorCode = 'not-found' | 'permission-denied' | 'conflict' | 'unknown';

export class DataOperationError extends Error {
  constructor(
    readonly code: DataErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'DataOperationError';
  }
}
