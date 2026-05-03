import { Subject } from 'rxjs';
import { AuthChangePayload } from '@database/types/auth-session';
import { IAuthService } from '@database/services/interfaces/auth-service.interface';

export const createAuthServiceMockShape = (): IAuthService => ({
  authChanges$: new Subject<AuthChangePayload>().asObservable(),
  signInWithPassword: () => Promise.resolve(),
  signInWithMagicLink: () => Promise.resolve(),
  signUpWithPassword: () => Promise.resolve(),
  sendPasswordResetEmail: () => Promise.resolve(),
  updatePassword: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
});
