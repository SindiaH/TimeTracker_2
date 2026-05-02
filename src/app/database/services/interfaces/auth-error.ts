export type AuthErrorCode =
  | 'invalid-credentials'
  | 'email-not-confirmed'
  | 'user-already-exists'
  | 'user-not-found'
  | 'weak-password'
  | 'same-password'
  | 'invalid-email'
  | 'rate-limit'
  | 'otp-disabled'
  | 'recovery-link-invalid'
  | 'signup-disabled'
  | 'unknown';

export class AuthOperationError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'AuthOperationError';
  }
}
