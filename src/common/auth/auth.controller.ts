import {
  Body,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { AuthService } from './auth.service';
import { ClientSignInDto } from './dto/client-sign-in.dto';
import { ConfigUtility } from '../../libs/config/config.utility';
import { ClientSignUpDto } from './dto/client-sign-up.dto';

@ApiTags('Clients Authorization')
@CommonController('auth')
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

  @Post('/sign-up')
  @ApiCreatedResponse()
  public async signUpClient(
    @Body() dto: ClientSignUpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signUpClient(dto);

    response.cookie(process.env.CLIENT_TOKEN_COOKIE, result.token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: this.USER_TOKEN_MAX_AGE_MS,
      path: '/',
    });

    return ResponseWrapper.from(
      {
        client: result.client,
      },
      false,
      'Signed up',
    );
  }

  @Post('/sign-in')
  @ApiOkResponse()
  public async signInClient(
    @Body() dto: ClientSignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signInClient(dto);

    response.cookie(process.env.CLIENT_TOKEN_COOKIE, result.token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: this.USER_TOKEN_MAX_AGE_MS,
      path: '/',
    });

    return ResponseWrapper.from(
      {
        client: result.client,
      },
      false,
      'Signed in',
    );
  }

  @Get('/me')
  @ApiOkResponse()
  public async getAuthorizedClient(@Req() request: Request) {
    const client = await this.authService.getAuthorizedClient(
      request.headers.authorization,
      request.headers.cookie,
    );

    if (!client) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Unauthorized'),
      );
    }

    return ResponseWrapper.from({ client });
  }

  @Post('/sign-out')
  @ApiOkResponse()
  public signOutClient(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(process.env.CLIENT_TOKEN_COOKIE, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/',
    });

    return ResponseWrapper.from({}, false, 'Signed out');
  }
}
