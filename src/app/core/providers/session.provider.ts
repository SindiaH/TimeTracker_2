import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { Session, SessionUser } from '@core/providers/session.type';
import { NotificationService } from '@core/services/notification/notification.service';
import {
  AUTH_SERVICE_TOKEN,
  AuthCredentials,
  IAuthService,
} from '@database/services/interfaces/auth-service.interface';
import { AuthErrorCode, AuthOperationError } from '@database/services/interfaces/auth-error';

const AUTH_ERROR_TRANSLATION_KEYS: Record<Exclude<AuthErrorCode, 'unknown'>, TranslationKey> = {
  'invalid-credentials': TRANSLATION_KEYS.auth.errors.invalidCredentials,
  'email-not-confirmed': TRANSLATION_KEYS.auth.errors.emailNotConfirmed,
  'user-already-exists': TRANSLATION_KEYS.auth.errors.userAlreadyExists,
  'user-not-found': TRANSLATION_KEYS.auth.errors.userNotFound,
  'weak-password': TRANSLATION_KEYS.auth.errors.weakPassword,
  'same-password': TRANSLATION_KEYS.auth.errors.samePassword,
  'invalid-email': TRANSLATION_KEYS.auth.errors.emailInvalid,
  'rate-limit': TRANSLATION_KEYS.auth.errors.rateLimit,
  'otp-disabled': TRANSLATION_KEYS.auth.errors.otpDisabled,
  'recovery-link-invalid': TRANSLATION_KEYS.auth.errors.recoveryLinkInvalid,
  'signup-disabled': TRANSLATION_KEYS.auth.errors.signupDisabled,
};

@Injectable({ providedIn: 'root' })
export class SessionProvider extends ServiceBase {
  private readonly authService: IAuthService = inject(AUTH_SERVICE_TOKEN);
  private readonly notificationService = inject(NotificationService);

  private readonly _session = signal<Session | null>(null);
  private readonly _isLoading = signal<boolean>(true);
  private readonly _isSigningOut = signal<boolean>(false);
  private readonly _isPasswordRecovery = signal<boolean>(false);

  readonly session: Signal<Session | null> = this._session.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isSigningOut: Signal<boolean> = this._isSigningOut.asReadonly();
  readonly isPasswordRecovery: Signal<boolean> = this._isPasswordRecovery.asReadonly();

  readonly user: Signal<SessionUser | null> = computed<SessionUser | null>(() => this._session()?.user ?? null);
  readonly isAuthenticated: Signal<boolean> = computed<boolean>(() => this._session() !== null);

  readonly session$: Observable<Session | null> = toObservable(this.session);
  readonly isAuthenticated$: Observable<boolean> = toObservable(this.isAuthenticated);

  constructor() {
    super();

    this.authService.authChanges$.pipe(this.takeUntilDestroyed()).subscribe((change) => {
      this._session.set(change.session);
      this._isLoading.set(false);
      if (change.event === 'password-recovery') {
        this._isPasswordRecovery.set(true);
      } else if (change.event === 'signed-out') {
        this._isPasswordRecovery.set(false);
      }
    });
  }

  async signInWithPassword(credentials: AuthCredentials): Promise<boolean> {
    this._isLoading.set(true);
    try {
      await this.authService.signInWithPassword(credentials);
      return true;
    } catch (error) {
      this.notificationService.showError(this.resolveAuthErrorKey(error));
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  async signInWithMagicLink(email: string, redirectTo?: string): Promise<boolean> {
    this._isLoading.set(true);
    try {
      await this.authService.signInWithMagicLink(email, redirectTo);
      return true;
    } catch (error) {
      this.notificationService.showError(this.resolveAuthErrorKey(error));
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  async signUpWithPassword(credentials: AuthCredentials): Promise<boolean> {
    this._isLoading.set(true);
    try {
      await this.authService.signUpWithPassword(credentials);
      return true;
    } catch (error) {
      this.notificationService.showError(this.resolveAuthErrorKey(error));
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  async sendPasswordResetEmail(email: string, redirectTo?: string): Promise<boolean> {
    try {
      await this.authService.sendPasswordResetEmail(email, redirectTo);
      return true;
    } catch (error) {
      this.notificationService.showError(this.resolveAuthErrorKey(error));
      return false;
    }
  }

  async updatePassword(newPassword: string): Promise<boolean> {
    this._isLoading.set(true);
    try {
      await this.authService.updatePassword(newPassword);
      return true;
    } catch (error) {
      this.notificationService.showError(this.resolveAuthErrorKey(error));
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  async signOut(): Promise<boolean> {
    this._isSigningOut.set(true);
    this._isLoading.set(true);
    try {
      await this.authService.signOut();
      return true;
    } catch (error) {
      this.notificationService.showError(this.resolveAuthErrorKey(error));
      this._session.set(null);
      this._isPasswordRecovery.set(false);
      return false;
    } finally {
      this._isLoading.set(false);
      this._isSigningOut.set(false);
    }
  }

  private resolveAuthErrorKey(error: unknown): TranslationKey {
    if (error instanceof AuthOperationError && error.code !== 'unknown') {
      return AUTH_ERROR_TRANSLATION_KEYS[error.code];
    }
    return TRANSLATION_KEYS.auth.errors.unexpected;
  }
}
