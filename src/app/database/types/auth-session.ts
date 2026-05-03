export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
};

export type AuthChangeEventType =
  | 'initial-session'
  | 'signed-in'
  | 'signed-out'
  | 'user-updated'
  | 'token-refreshed'
  | 'password-recovery';

export type AuthChangePayload = {
  event: AuthChangeEventType;
  session: AuthSession | null;
};
