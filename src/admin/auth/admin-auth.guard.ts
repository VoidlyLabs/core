import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ResponseWrapper } from '../../libs/response';
import { ADMIN_AUTH_PUBLIC_KEY } from './admin-auth.constants';
import { JwtUtility } from '../../libs/jwt/jwt.utility';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic =
      Reflect.getMetadata(ADMIN_AUTH_PUBLIC_KEY, ctx.getHandler()) === true ||
      Reflect.getMetadata(ADMIN_AUTH_PUBLIC_KEY, ctx.getClass()) === true;

    if (isPublic) {
      return true;
    }

    const userId = await JwtUtility.userIdFromCtx(ctx);

    if (!userId) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Unauthorized'),
      );
    }

    return true;
  }
}
