import { inject, Injectable } from '@angular/core';
import { AuthChangeEvent, AuthError, Session as SupabaseSession, Subscription } from '@supabase/supabase-js';
import { Observable, Subject } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import { AuthCredentials, IAuthService } from '@database/services/interfaces/auth-service.interface';
import { SupabaseAuthClient } from '@database/services/supabase/supabase-auth-client';
import { AuthChangeEventType, AuthChangePayload, AuthSession } from '@database/types/auth-session';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthService extends ServiceBase implements IAuthService {
  private readonly client = inject(SupabaseAuthClient).client;
  private readonly authChangesSubject = new Subject<AuthChangePayload>();
  private readonly subscription: Subscription;

  readonly authChanges$: Observable<AuthChangePayload> = this.authChangesSubject.asObservable();

  constructor() {
    super();
    const { data } = this.client.auth.onAuthStateChange((event, session) => {
      const mapped = this.mapAuthEvent(event);
      if (mapped !== null) {
        this.authChangesSubject.next({
          event: mapped,
          session: this.toAuthSession(session),
        });
      }
    });
    this.subscription = data.subscription;
    this.destroyRef.onDestroy(() => {
      this.subscription.unsubscribe();
      this.authChangesSubject.complete();
    });
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) {
      throw this.mapError(error);
    }
    return this.toAuthSession(data.session);
  }

  async signInWithPassword(credentials: AuthCredentials): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signInWithPassword(credentials);
    if (error || !data.session) {
      throw this.mapError(error ?? new Error('No session returned from signInWithPassword'));
    }
    return this.toAuthSession(data.session)!;
  }

  async signInWithMagicLink(email: string, redirectTo?: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });
    if (error) {
      throw this.mapError(error);
    }
  }

  async signUpWithPassword(credentials: AuthCredentials): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.signUp(credentials);
    if (error) {
      throw this.mapError(error);
    }
    return this.toAuthSession(data.session);
  }

  async sendPasswordResetEmail(email: string, redirectTo?: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      throw this.mapError(error);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) {
      throw this.mapError(error);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw this.mapError(error);
    }
  }

  async setSessionFromTokens(accessToken: string, refreshToken: string): Promise<AuthSession> {
    const { data, error } = await this.client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error || !data.session) {
      throw this.mapError(error ?? new Error('No session returned from setSession'));
    }
    return this.toAuthSession(data.session)!;
  }

  private toAuthSession(session: SupabaseSession | null): AuthSession | null {
    if (!session || !session.user.email) {
      return null;
    }
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ?? null,
    };
  }

  private mapAuthEvent(event: AuthChangeEvent): AuthChangeEventType | null {
    switch (event) {
      case 'SIGNED_IN':
      case 'INITIAL_SESSION':
      case 'USER_UPDATED':
        return 'signed-in';
      case 'SIGNED_OUT':
        return 'signed-out';
      case 'TOKEN_REFRESHED':
        return 'token-refreshed';
      case 'PASSWORD_RECOVERY':
        return 'password-recovery';
      default:
        return null;
    }
  }

  private mapError(error: AuthError | Error): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unknown auth error');
  }
}
