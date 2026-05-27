import { ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';

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

    const payload = await this.clientJwtService
      .verifyAsync(token, {
        secret: process.env.CLIENT_JWT_SECRET,
      })
      .catch(() => null);

    return typeof payload?.id === 'string' ? payload.id : null;
  }

  public static async userIdFromCtx(
    ctx: ExecutionContext,
  ): Promise<string | null> {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const token = this.tokenFromRequest(request, this.serverAccessTokenCookie);

    if (!token) {
      return null;
    }

    const payload = await this.serverJwtService
      .verifyAsync(token, {
        secret: process.env.SERVER_JWT_SECRET,
      })
      .catch(() => null);

    return typeof payload?.id === 'string' ? payload.id : null;
  }

  static async clientIdFromHeader(authHeader: string): Promise<string | null> {
    const token = authHeader.split(' ')[1];
    const payload = await this.clientJwtService
      .verifyAsync(token, {
        secret: process.env.CLIENT_JWT_SECRET,
      })
      .catch(() => null);

    return typeof payload?.id === 'string' ? payload.id : null;
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

    const payload = await this.clientJwtService
      .verifyAsync(token, {
        secret: process.env.CLIENT_JWT_SECRET,
      })
      .catch(() => null);

    return typeof payload?.id === 'string' ? payload.id : null;
  }

  static async userIdFromHeader(authHeader: string): Promise<string | null> {
    const token = authHeader.split(' ')[1];
    const payload = await this.serverJwtService
      .verifyAsync(token, {
        secret: process.env.SERVER_JWT_SECRET,
      })
      .catch(() => null);

    return typeof payload?.id === 'string' ? payload.id : null;
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

    const payload = await this.serverJwtService
      .verifyAsync(token, {
        secret: process.env.SERVER_JWT_SECRET,
      })
      .catch(() => null);

    return typeof payload?.id === 'string' ? payload.id : null;
  }

  public static generateAccessToken(
    id: string,
    side: 'client' | 'server' = 'client',
  ): string {
    const service =
      side === 'client' ? this.clientJwtService : this.serverJwtService;

    return service.sign(
      { id },
      {
        secret:
          side === 'client'
            ? process.env.CLIENT_JWT_SECRET
            : process.env.SERVER_JWT_SECRET,
        expiresIn: '3d',
      },
    );
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
