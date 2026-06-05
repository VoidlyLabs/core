import { JwtUtility } from './jwt.utility';

describe('JwtUtility', () => {
  beforeEach(() => {
    process.env.CLIENT_JWT_SECRET = 'same-secret-for-boundary-test';
    process.env.SERVER_JWT_SECRET = 'same-secret-for-boundary-test';
  });

  it('does not read a client token as a user token', async () => {
    const token = JwtUtility.generateAccessToken('client-id', 'client');

    await expect(
      JwtUtility.clientIdFromHeader(`Bearer ${token}`),
    ).resolves.toBe('client-id');
    await expect(JwtUtility.userIdFromHeader(`Bearer ${token}`)).resolves.toBe(
      null,
    );
  });

  it('does not read a user token as a client token', async () => {
    const token = JwtUtility.generateAccessToken('user-id', 'server');

    await expect(JwtUtility.userIdFromHeader(`Bearer ${token}`)).resolves.toBe(
      'user-id',
    );
    await expect(
      JwtUtility.clientIdFromHeader(`Bearer ${token}`),
    ).resolves.toBe(null);
  });

  it('reads a valid user token when duplicate user cookies include stale values', async () => {
    const token = JwtUtility.generateAccessToken('user-id', 'server');
    const cookieHeader = `user_access_token=stale-token; user_access_token=${encodeURIComponent(token)}`;

    await expect(JwtUtility.userIdFromCookieHeader(cookieHeader)).resolves.toBe(
      'user-id',
    );
  });

  it('reads a valid client token when duplicate client cookies include stale values', async () => {
    const token = JwtUtility.generateAccessToken('client-id', 'client');
    const cookieHeader = `client_access_token=stale-token; client_access_token=${encodeURIComponent(token)}`;

    await expect(
      JwtUtility.clientIdFromCookieHeader(cookieHeader),
    ).resolves.toBe('client-id');
  });
});
