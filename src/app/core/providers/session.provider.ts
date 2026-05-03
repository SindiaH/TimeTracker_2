import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import { Session, SessionUser } from '@core/providers/session.type';
import {
  AUTH_SERVICE_TOKEN,
  AuthCredentials,
  IAuthService,
} from '@database/services/interfaces/auth-service.interface';

@Injectable({ providedIn: 'root' })
export class SessionProvider extends ServiceBase {
  private readonly authService: IAuthService = inject(AUTH_SERVICE_TOKEN);

  private readonly _session = signal<Session | null>(null);
  private readonly _isLoading = signal<boolean>(true);
  private readonly _isSigningOut = signal<boolean>(false);
  private readonly _isPasswordRecovery = signal<boolean>(false);
  private readonly _lastError = signal<Error | null>(null);

  readonly session: Signal<Session | null> = this._session.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isSigningOut: Signal<boolean> = this._isSigningOut.asReadonly();
  readonly isPasswordRecovery: Signal<boolean> = this._isPasswordRecovery.asReadonly();
  readonly lastError: Signal<Error | null> = this._lastError.asReadonly();

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

  async signInWithPassword(credentials: AuthCredentials): Promise<void> {
    this._isLoading.set(true);
    this._lastError.set(null);
    try {
      await this.authService.signInWithPassword(credentials);
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async signInWithMagicLink(email: string, redirectTo?: string): Promise<void> {
    this._isLoading.set(true);
    this._lastError.set(null);
    try {
      await this.authService.signInWithMagicLink(email, redirectTo);
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async signUpWithPassword(credentials: AuthCredentials): Promise<void> {
    this._isLoading.set(true);
    this._lastError.set(null);
    try {
      await this.authService.signUpWithPassword(credentials);
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async sendPasswordResetEmail(email: string, redirectTo?: string): Promise<void> {
    this._lastError.set(null);
    try {
      await this.authService.sendPasswordResetEmail(email, redirectTo);
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    this._isLoading.set(true);
    this._lastError.set(null);
    try {
      await this.authService.updatePassword(newPassword);
    } catch (error) {
      this._lastError.set(this.toError(error));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async signOut(): Promise<void> {
    this._isSigningOut.set(true);
    this._isLoading.set(true);
    this._lastError.set(null);
    try {
      await this.authService.signOut();
    } catch (error) {
      this._lastError.set(this.toError(error));
      this._session.set(null);
      this._isPasswordRecovery.set(false);
    } finally {
      this._isLoading.set(false);
      this._isSigningOut.set(false);
    }
  }

  private toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}
