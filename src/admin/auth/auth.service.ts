import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { ResponseWrapper } from '../../libs/response';
import { JwtUtility } from '../../libs/jwt/jwt.utility';
import { UsersService } from '../users/users.service';
import { UserSignInDto } from './dto/user-sign-in.dto';

type UserSignInResult = {
  token: string;
  user: {
    id: string;
    username: string;
    balance: number;
  };
};

type AuthorizedUserResult = {
  id: string;
  username: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  public async signInUser(dto: UserSignInDto): Promise<UserSignInResult> {
    const client = await this.usersService.findByUsername(dto.username);

    if (!client || !(await compare(dto.password, client.password))) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Invalid username or password'),
      );
    }

    const id = client._id.toString();
    const token = JwtUtility.generateAccessToken(id, 'server');

    return {
      token,
      user: {
        id,
        username: client.username,
        balance: client.balance ?? 0,
      },
    };
  }

  public async getAuthorizedUser(
    authHeader: string | undefined,
    cookieHeader: string | undefined,
  ): Promise<AuthorizedUserResult | null> {
    const id = authHeader?.startsWith('Bearer ')
      ? await JwtUtility.userIdFromHeader(authHeader)
      : await JwtUtility.userIdFromCookieHeader(cookieHeader);

    if (!id) {
      return null;
    }

    const user = await this.usersService.findById(id);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      username: user.username,
      balance: user.balance ?? 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
