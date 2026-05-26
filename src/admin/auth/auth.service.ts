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
  };
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
    const token = JwtUtility.generateAccessToken(id, 'client');

    return {
      token,
      user: {
        id,
        username: data.username,
      },
    };
  }
}
