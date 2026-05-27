import {
  Body,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AdminController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { AuthService } from './auth.service';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { ConfigUtility } from '../../utility/config/config.utility';

const USER_TOKEN_COOKIE = 'user_access_token';

@ApiTags('Users Authorization')
@AdminController('auth')
export class AuthController {
  private readonly USER_TOKEN_MAX_AGE_MS: number;

  constructor(
    private readonly authService: AuthService,
    private readonly configUtility: ConfigUtility,
  ) {
    this.USER_TOKEN_MAX_AGE_MS =
      parseInt(this.configUtility.get('USER_TOKEN_MAX_AGE_HRS')) *
      60 *
      60 *
      1000;
  }

  @Post('/sign-in')
  @ApiOkResponse()
  public async signInClient(
    @Body() dto: UserSignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signInUser(dto);

    response.cookie(USER_TOKEN_COOKIE, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.USER_TOKEN_MAX_AGE_MS,
      path: '/',
    });

    return ResponseWrapper.from(
      {
        client: result.user,
      },
      false,
      'Signed in',
    );
  }

  @Get('/me')
  @ApiOkResponse()
  public async getAuthorizedUser(@Req() request: Request) {
    const user = await this.authService.getAuthorizedUser(
      request.headers.authorization,
      request.headers.cookie,
    );

    if (!user) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Unauthorized'),
      );
    }

    return ResponseWrapper.from({ user });
  }

  @Post('/sign-out')
  @ApiOkResponse()
  public signOutClient(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(process.env.USER_TOKEN_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return ResponseWrapper.from({}, false, 'Signed out');
  }
}
