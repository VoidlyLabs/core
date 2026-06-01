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
});
