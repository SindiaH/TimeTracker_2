import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { Session, SessionUser } from '@core/providers/session.type';

export type SessionProviderSpy = {
  session: WritableSignal<Session | null>;
  isLoading: WritableSignal<boolean>;
  isSigningOut: WritableSignal<boolean>;
  isPasswordRecovery: WritableSignal<boolean>;
  lastError: WritableSignal<Error | null>;
  user: Signal<SessionUser | null>;
  isAuthenticated: Signal<boolean>;
  session$: Observable<Session | null>;
  isAuthenticated$: Observable<boolean>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signInWithMagicLink: ReturnType<typeof vi.fn>;
  signUpWithPassword: ReturnType<typeof vi.fn>;
  sendPasswordResetEmail: ReturnType<typeof vi.fn>;
  updatePassword: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
};

export const createSessionProviderSpy = (): SessionProviderSpy => {
  const session = signal<Session | null>(null);
  const isLoading = signal<boolean>(false);
  const isSigningOut = signal<boolean>(false);
  const isPasswordRecovery = signal<boolean>(false);
  const lastError = signal<Error | null>(null);

  return {
    session,
    isLoading,
    isSigningOut,
    isPasswordRecovery,
    lastError,
    user: computed<SessionUser | null>(() => session()?.user ?? null),
    isAuthenticated: computed<boolean>(() => session() !== null),
    session$: of<Session | null>(null),
    isAuthenticated$: of<boolean>(false),
    signInWithPassword: vi.fn().mockResolvedValue(undefined),
    signInWithMagicLink: vi.fn().mockResolvedValue(undefined),
    signUpWithPassword: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    updatePassword: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
};
