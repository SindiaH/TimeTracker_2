import { AuthChangePayload, AuthSession, AuthUser } from '@database/types/auth-session';
import { TEST_USER_ID } from '@testing/constants/testing.constants';

export const mockAuthUser: AuthUser = {
  id: TEST_USER_ID,
  email: 'test.user@example.com',
};

export const mockAuthSession: AuthSession = {
  user: mockAuthUser,
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: 9_999_999_999,
};

export const mockAuthChangePayload = (
  event: AuthChangePayload['event'],
  session: AuthSession | null = mockAuthSession,
): AuthChangePayload => ({ event, session });
