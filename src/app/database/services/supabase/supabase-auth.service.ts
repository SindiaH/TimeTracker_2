import { inject, Injectable } from '@angular/core';
import { AuthChangeEvent, AuthError, Session as SupabaseSession, Subscription } from '@supabase/supabase-js';
import { Observable, ReplaySubject } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import { AuthErrorCode, AuthOperationError } from '@database/services/interfaces/auth-error';
import { AuthCredentials, IAuthService } from '@database/services/interfaces/auth-service.interface';
import { SupabaseAuthClient } from '@database/services/supabase/supabase-auth-client';
import { AuthChangeEventType, AuthChangePayload, AuthSession } from '@database/types/auth-session';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthService extends ServiceBase implements IAuthService {
  private readonly client = inject(SupabaseAuthClient).client;
  private readonly authChangesSubject = new ReplaySubject<AuthChangePayload>(1);
  private readonly subscription: Subscription;

  readonly authChanges$: Observable<AuthChangePayload> = this.authChangesSubject.asObservable();

  constructor() {
    super();
    const { data } = this.client.auth.onAuthStateChange((event, session) => {
      const mapped = this.mapAuthEvent(event);
      if (mapped !== null) {
        this.authChangesSubject.next({
          event: mapped,
          session: this.safeToAuthSession(session),
        });
      }
    });
    this.subscription = data.subscription;
    this.destroyRef.onDestroy(() => {
      this.subscription.unsubscribe();
      this.authChangesSubject.complete();
    });
  }

  async signInWithPassword(credentials: AuthCredentials): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword(credentials);
    if (error) {
      throw this.mapError(error);
    }
  }

  async signInWithMagicLink(email: string, redirectTo?: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      },
    });
    if (error) {
      throw this.mapError(error);
    }
  }

  async signUpWithPassword(credentials: AuthCredentials): Promise<void> {
    const { error } = await this.client.auth.signUp(credentials);
    if (error) {
      throw this.mapError(error);
    }
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

  private toAuthSession(session: SupabaseSession): AuthSession {
    if (!session.user.email) {
      throw new AuthOperationError('unknown', 'Session received without an email address');
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

  private safeToAuthSession(session: SupabaseSession | null): AuthSession | null {
    if (!session) {
      return null;
    }
    try {
      return this.toAuthSession(session);
    } catch (error) {
      console.error('[SupabaseAuthService] Failed to map session', error);
      return null;
    }
  }

  private mapAuthEvent(event: AuthChangeEvent): AuthChangeEventType | null {
    switch (event) {
      case 'INITIAL_SESSION':
        return 'initial-session';
      case 'SIGNED_IN':
        return 'signed-in';
      case 'SIGNED_OUT':
        return 'signed-out';
      case 'USER_UPDATED':
        return 'user-updated';
      case 'TOKEN_REFRESHED':
        return 'token-refreshed';
      case 'PASSWORD_RECOVERY':
        return 'password-recovery';
      default:
        return null;
    }
  }

  private mapError(error: unknown): AuthOperationError {
    if (error instanceof AuthOperationError) {
      return error;
    }
    const message = error instanceof Error ? error.message : 'Unknown auth error';
    return new AuthOperationError(this.toAuthErrorCode(error), message, error);
  }

  private toAuthErrorCode(error: unknown): AuthErrorCode {
    if (!(error instanceof AuthError) || error.code === undefined) {
      return 'unknown';
    }
    switch (error.code) {
      case 'invalid_credentials':
        return 'invalid-credentials';
      case 'email_not_confirmed':
        return 'email-not-confirmed';
      case 'user_already_exists':
      case 'email_exists':
        return 'user-already-exists';
      case 'user_not_found':
        return 'user-not-found';
      case 'weak_password':
        return 'weak-password';
      case 'same_password':
        return 'same-password';
      case 'email_address_invalid':
      case 'validation_failed':
        return 'invalid-email';
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
      case 'over_sms_send_rate_limit':
        return 'rate-limit';
      case 'otp_disabled':
        return 'otp-disabled';
      case 'otp_expired':
      case 'flow_state_not_found':
      case 'flow_state_expired':
      case 'bad_code_verifier':
        return 'recovery-link-invalid';
      case 'signup_disabled':
        return 'signup-disabled';
      default:
        return 'unknown';
    }
  }
}
