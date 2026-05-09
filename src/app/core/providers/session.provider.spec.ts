import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { SessionProvider } from '@core/providers/session.provider';
import { NotificationService } from '@core/services/notification/notification.service';
import { AuthChangePayload } from '@database/types/auth-session';
import { AuthOperationError } from '@database/services/interfaces/auth-error';
import {
  AUTH_SERVICE_TOKEN,
  AuthCredentials,
  IAuthService,
} from '@database/services/interfaces/auth-service.interface';
import { mockAuthChangePayload, mockAuthSession, mockAuthUser } from '@testing/mocks/auth-session.mock';
import { NotificationServiceStub } from '@testing/stubs/notification-service.stub';

const credentials: AuthCredentials = {
  email: mockAuthUser.email,
  password: 'pw-123456',
};

describe('SessionProvider', () => {
  let authChanges$: Subject<AuthChangePayload>;
  let authService: IAuthService;
  let notificationService: NotificationServiceStub;

  beforeEach(() => {
    authChanges$ = new Subject<AuthChangePayload>();
    notificationService = new NotificationServiceStub();
    authService = {
      authChanges$: authChanges$.asObservable(),
      signInWithPassword: vi.fn().mockResolvedValue(undefined),
      signInWithMagicLink: vi.fn().mockResolvedValue(undefined),
      signUpWithPassword: vi.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
      updatePassword: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AUTH_SERVICE_TOKEN, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        SessionProvider,
      ],
    });
  });

  it('starts with isLoading=true and no session', () => {
    const provider = TestBed.inject(SessionProvider);

    expect(provider.session()).toBeNull();
    expect(provider.isLoading()).toBe(true);
    expect(provider.isAuthenticated()).toBe(false);
    expect(provider.user()).toBeNull();
  });

  it('updates session and clears isLoading on signed-in event', () => {
    const provider = TestBed.inject(SessionProvider);

    authChanges$.next(mockAuthChangePayload('signed-in'));

    expect(provider.session()).toEqual(mockAuthSession);
    expect(provider.user()).toEqual(mockAuthUser);
    expect(provider.isAuthenticated()).toBe(true);
    expect(provider.isLoading()).toBe(false);
  });

  it('flags password-recovery and resets it on sign-out', () => {
    const provider = TestBed.inject(SessionProvider);

    authChanges$.next(mockAuthChangePayload('password-recovery'));
    expect(provider.isPasswordRecovery()).toBe(true);

    authChanges$.next(mockAuthChangePayload('signed-out', null));
    expect(provider.isPasswordRecovery()).toBe(false);
    expect(provider.session()).toBeNull();
  });

  it('signInWithPassword forwards to the auth service, returns true and toggles isLoading', async () => {
    const provider = TestBed.inject(SessionProvider);
    authChanges$.next(mockAuthChangePayload('initial-session', null));
    expect(provider.isLoading()).toBe(false);

    const promise = provider.signInWithPassword(credentials);
    expect(provider.isLoading()).toBe(true);

    const result = await promise;

    expect(result).toBe(true);
    expect(authService.signInWithPassword).toHaveBeenCalledWith(credentials);
    expect(provider.isLoading()).toBe(false);
    expect(notificationService.errorCalls).toEqual([]);
  });

  it('signInWithPassword maps AuthOperationError to its translation key and returns false', async () => {
    (authService.signInWithPassword as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new AuthOperationError('invalid-credentials', 'invalid'),
    );
    const provider = TestBed.inject(SessionProvider);

    const result = await provider.signInWithPassword(credentials);

    expect(result).toBe(false);
    expect(provider.isLoading()).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.auth.errors.invalidCredentials }]);
  });

  it('signOut clears local session even when the auth service rejects', async () => {
    (authService.signOut as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('network down'));
    const provider = TestBed.inject(SessionProvider);
    authChanges$.next(mockAuthChangePayload('signed-in'));
    authChanges$.next(mockAuthChangePayload('password-recovery'));

    const result = await provider.signOut();

    expect(result).toBe(false);
    expect(authService.signOut).toHaveBeenCalledTimes(1);
    expect(provider.session()).toBeNull();
    expect(provider.isPasswordRecovery()).toBe(false);
    expect(provider.isSigningOut()).toBe(false);
    expect(provider.isLoading()).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.auth.errors.unexpected }]);
  });

  it('sendPasswordResetEmail does not toggle global loading', async () => {
    const provider = TestBed.inject(SessionProvider);
    authChanges$.next(mockAuthChangePayload('initial-session', null));

    const promise = provider.sendPasswordResetEmail(mockAuthUser.email, 'https://app/redirect');
    expect(provider.isLoading()).toBe(false);
    const result = await promise;

    expect(result).toBe(true);
    expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(mockAuthUser.email, 'https://app/redirect');
    expect(notificationService.errorCalls).toEqual([]);
  });

  it('falls back to the unexpected key for non-AuthOperationError throws', async () => {
    (authService.signInWithMagicLink as ReturnType<typeof vi.fn>).mockRejectedValueOnce('boom');
    const provider = TestBed.inject(SessionProvider);

    const result = await provider.signInWithMagicLink(mockAuthUser.email);

    expect(result).toBe(false);
    expect(notificationService.errorCalls).toEqual([{ messageKey: TRANSLATION_KEYS.auth.errors.unexpected }]);
  });
});
