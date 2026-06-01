import { ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';

type TokenSide = 'client' | 'server';
type AccessTokenPayload = {
  id?: unknown;
  side?: unknown;
};

export class JwtUtility {
  private static readonly clientAccessTokenCookie = 'client_access_token';
  private static readonly serverAccessTokenCookie = 'user_access_token';

  private static clientJwtService = new JwtService({
    secret: process.env.CLIENT_JWT_SECRET,
  });
  private static serverJwtService = new JwtService({
    secret: process.env.SERVER_JWT_SECRET,
  });

  public static async clientIdFromCtx(
    ctx: ExecutionContext,
  ): Promise<string | null> {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const token = this.tokenFromRequest(request, this.clientAccessTokenCookie);

    if (!token) {
      return null;
    }

    const payload = await this.verifyAccessToken(token, 'client');

    return this.idFromPayload(payload);
  }

  public static async userIdFromCtx(
    ctx: ExecutionContext,
  ): Promise<string | null> {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const token = this.tokenFromRequest(request, this.serverAccessTokenCookie);

    if (!token) {
      return null;
    }

    const payload = await this.verifyAccessToken(token, 'server');

    return this.idFromPayload(payload);
  }

  static async clientIdFromHeader(authHeader: string): Promise<string | null> {
    const token = authHeader.split(' ')[1];
    const payload = await this.verifyAccessToken(token, 'client');

    return this.idFromPayload(payload);
  }

  static async clientIdFromCookieHeader(
    cookieHeader: string | undefined,
  ): Promise<string | null> {
    if (!cookieHeader) {
      return null;
    }

    const token = this.cookieValue(cookieHeader, this.clientAccessTokenCookie);

    if (!token) {
      return null;
    }

    const payload = await this.verifyAccessToken(token, 'client');

    return this.idFromPayload(payload);
  }

  static async userIdFromHeader(authHeader: string): Promise<string | null> {
    const token = authHeader.split(' ')[1];
    const payload = await this.verifyAccessToken(token, 'server');

    return this.idFromPayload(payload);
  }

  static async userIdFromCookieHeader(
    cookieHeader: string | undefined,
  ): Promise<string | null> {
    if (!cookieHeader) {
      return null;
    }

    const token = this.cookieValue(cookieHeader, this.serverAccessTokenCookie);

    if (!token) {
      return null;
    }

    const payload = await this.verifyAccessToken(token, 'server');

    return this.idFromPayload(payload);
  }

  public static generateAccessToken(
    id: string,
    side: TokenSide = 'client',
  ): string {
    const service =
      side === 'client' ? this.clientJwtService : this.serverJwtService;

    return service.sign(
      { id, side },
      {
        secret:
          side === 'client'
            ? process.env.CLIENT_JWT_SECRET
            : process.env.SERVER_JWT_SECRET,
        expiresIn: '3d',
      },
    );
  }

  private static async verifyAccessToken(
    token: string,
    side: TokenSide,
  ): Promise<AccessTokenPayload | null> {
    const service =
      side === 'client' ? this.clientJwtService : this.serverJwtService;
    const payload = await service
      .verifyAsync<AccessTokenPayload>(token, {
        secret:
          side === 'client'
            ? process.env.CLIENT_JWT_SECRET
            : process.env.SERVER_JWT_SECRET,
      })
      .catch(() => null);

    return payload?.side === side ? payload : null;
  }

  private static idFromPayload(
    payload: AccessTokenPayload | null,
  ): string | null {
    return typeof payload?.id === 'string' ? payload.id : null;
  }

  private static tokenFromRequest(
    request: FastifyRequest,
    cookieName: string,
  ): string | null {
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1] || null;
    }

    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    return this.cookieValue(cookieHeader, cookieName);
  }

  private static cookieValue(
    cookieHeader: string,
    cookieName: string,
  ): string | null {
    const cookies = cookieHeader.split(';');

    for (const cookie of cookies) {
      const [name, ...valueParts] = cookie.trim().split('=');

      if (name === cookieName) {
        return decodeURIComponent(valueParts.join('='));
      }
    }

    return null;
  }
}
