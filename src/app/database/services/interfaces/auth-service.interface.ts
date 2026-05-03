import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthChangePayload } from '@database/types/auth-session';

export type AuthCredentials = {
  email: string;
  password: string;
};

export interface IAuthService {
  readonly authChanges$: Observable<AuthChangePayload>;
  signInWithPassword(credentials: AuthCredentials): Promise<void>;
  signInWithMagicLink(email: string, redirectTo?: string): Promise<void>;
  signUpWithPassword(credentials: AuthCredentials): Promise<void>;
  sendPasswordResetEmail(email: string, redirectTo?: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  signOut(): Promise<void>;
}

export const AUTH_SERVICE_TOKEN = new InjectionToken<IAuthService>('AUTH_SERVICE_TOKEN');
