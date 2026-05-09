import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { Session, SessionUser } from '@core/providers/session.type';

export type SessionProviderSpy = {
  session: WritableSignal<Session | null>;
  isLoading: WritableSignal<boolean>;
  isSigningOut: WritableSignal<boolean>;
  isPasswordRecovery: WritableSignal<boolean>;
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

  return {
    session,
    isLoading,
    isSigningOut,
    isPasswordRecovery,
    user: computed<SessionUser | null>(() => session()?.user ?? null),
    isAuthenticated: computed<boolean>(() => session() !== null),
    session$: of<Session | null>(null),
    isAuthenticated$: of<boolean>(false),
    signInWithPassword: vi.fn().mockResolvedValue(true),
    signInWithMagicLink: vi.fn().mockResolvedValue(true),
    signUpWithPassword: vi.fn().mockResolvedValue(true),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
    updatePassword: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(true),
  };
};
