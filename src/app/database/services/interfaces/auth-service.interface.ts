import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthChangePayload, AuthSession } from '@database/types/auth-session';

export type AuthCredentials = {
  email: string;
  password: string;
};

export interface IAuthService {
  readonly authChanges$: Observable<AuthChangePayload>;
  getCurrentSession(): Promise<AuthSession | null>;
  signInWithPassword(credentials: AuthCredentials): Promise<AuthSession>;
  signInWithMagicLink(email: string, redirectTo?: string): Promise<void>;
  signUpWithPassword(credentials: AuthCredentials): Promise<AuthSession | null>;
  sendPasswordResetEmail(email: string, redirectTo?: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  signOut(): Promise<void>;
}

export const AUTH_SERVICE_TOKEN = new InjectionToken<IAuthService>('AUTH_SERVICE_TOKEN');
