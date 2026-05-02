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

export type AuthChangeEventType = 'signed-in' | 'signed-out' | 'token-refreshed' | 'password-recovery';

export type AuthChangePayload = {
  event: AuthChangeEventType;
  session: AuthSession | null;
};
