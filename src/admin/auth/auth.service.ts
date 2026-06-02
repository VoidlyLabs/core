import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { ResponseWrapper } from '../../libs/response';
import { JwtUtility } from '../../libs/jwt/jwt.utility';
import { User } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { UserSignInDto } from './dto/user-sign-in.dto';

type UserDocument = User & {
  _id: { toString(): string };
  toObject?: () => User & { _id: { toString(): string } };
};

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

    const document = client as UserDocument;
    const data = document.toObject?.() ?? document;
    const id = data._id.toString();
    const token = JwtUtility.generateAccessToken(id, 'server');

    return {
      token,
      user: {
        id,
        username: data.username,
        balance: data.balance ?? 0,
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

    const document = user as UserDocument;
    const data = document.toObject?.() ?? document;

    return {
      id: data._id.toString(),
      username: data.username,
      balance: data.balance ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
