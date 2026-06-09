import { UnauthorizedException } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { ADMIN_AUTH_PUBLIC_KEY } from './admin-auth.constants';
import { JwtUtility } from '../../libs/jwt/jwt.utility';

describe('AdminAuthGuard', () => {
  const handler = () => undefined;
  class Controller {}

  const createContext = (headers: Record<string, string | undefined> = {}) =>
    ({
      getHandler: () => handler,
      getClass: () => Controller,
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    }) as any;

  beforeEach(() => {
    process.env.SERVER_JWT_SECRET = 'server-test-secret';
    Reflect.deleteMetadata(ADMIN_AUTH_PUBLIC_KEY, handler);
    Reflect.deleteMetadata(ADMIN_AUTH_PUBLIC_KEY, Controller);
  });

  it('allows public handlers without token', async () => {
    Reflect.defineMetadata(ADMIN_AUTH_PUBLIC_KEY, true, handler);

    await expect(
      new AdminAuthGuard().canActivate(createContext()),
    ).resolves.toBe(true);
  });

  it('allows request with valid admin bearer token', async () => {
    const token = JwtUtility.generateAccessToken('user-id', 'server');

    await expect(
      new AdminAuthGuard().canActivate(
        createContext({ authorization: `Bearer ${token}` }),
      ),
    ).resolves.toBe(true);
  });

  it('rejects request without valid admin token', async () => {
    await expect(
      new AdminAuthGuard().canActivate(createContext()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
