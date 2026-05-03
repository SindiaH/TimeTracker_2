import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { SessionProvider } from '@core/providers/session.provider';
import { AuthChangePayload } from '@database/types/auth-session';
import {
  AUTH_SERVICE_TOKEN,
  AuthCredentials,
  IAuthService,
} from '@database/services/interfaces/auth-service.interface';
import { mockAuthChangePayload, mockAuthSession, mockAuthUser } from '@testing/mocks/auth-session.mock';

const credentials: AuthCredentials = {
  email: mockAuthUser.email,
  password: 'pw-123456',
};

describe('SessionProvider', () => {
  let authChanges$: Subject<AuthChangePayload>;
  let authService: IAuthService;

  beforeEach(() => {
    authChanges$ = new Subject<AuthChangePayload>();
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
      providers: [{ provide: AUTH_SERVICE_TOKEN, useValue: authService }, SessionProvider],
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

  it('signInWithPassword forwards to the auth service and toggles isLoading', async () => {
    const provider = TestBed.inject(SessionProvider);
    authChanges$.next(mockAuthChangePayload('initial-session', null));
    expect(provider.isLoading()).toBe(false);

    const promise = provider.signInWithPassword(credentials);
    expect(provider.isLoading()).toBe(true);

    await promise;

    expect(authService.signInWithPassword).toHaveBeenCalledWith(credentials);
    expect(provider.isLoading()).toBe(false);
    expect(provider.lastError()).toBeNull();
  });

  it('signInWithPassword captures error and rethrows', async () => {
    const failure = new Error('invalid credentials');
    (authService.signInWithPassword as ReturnType<typeof vi.fn>).mockRejectedValueOnce(failure);
    const provider = TestBed.inject(SessionProvider);

    await expect(provider.signInWithPassword(credentials)).rejects.toBe(failure);

    expect(provider.lastError()).toBe(failure);
    expect(provider.isLoading()).toBe(false);
  });

  it('signOut clears local session even when the auth service rejects', async () => {
    const failure = new Error('network down');
    (authService.signOut as ReturnType<typeof vi.fn>).mockRejectedValueOnce(failure);
    const provider = TestBed.inject(SessionProvider);
    authChanges$.next(mockAuthChangePayload('signed-in'));
    authChanges$.next(mockAuthChangePayload('password-recovery'));

    await provider.signOut();

    expect(authService.signOut).toHaveBeenCalledTimes(1);
    expect(provider.session()).toBeNull();
    expect(provider.isPasswordRecovery()).toBe(false);
    expect(provider.lastError()).toBe(failure);
    expect(provider.isSigningOut()).toBe(false);
    expect(provider.isLoading()).toBe(false);
  });

  it('sendPasswordResetEmail does not toggle global loading', async () => {
    const provider = TestBed.inject(SessionProvider);
    authChanges$.next(mockAuthChangePayload('initial-session', null));

    const promise = provider.sendPasswordResetEmail(mockAuthUser.email, 'https://app/redirect');
    expect(provider.isLoading()).toBe(false);
    await promise;

    expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(mockAuthUser.email, 'https://app/redirect');
    expect(provider.lastError()).toBeNull();
  });

  it('wraps non-Error throws into Error instances', async () => {
    (authService.signInWithMagicLink as ReturnType<typeof vi.fn>).mockRejectedValueOnce('boom');
    const provider = TestBed.inject(SessionProvider);

    await expect(provider.signInWithMagicLink(mockAuthUser.email)).rejects.toBe('boom');

    const captured = provider.lastError();
    expect(captured).toBeInstanceOf(Error);
    expect(captured?.message).toBe('boom');
  });
});
