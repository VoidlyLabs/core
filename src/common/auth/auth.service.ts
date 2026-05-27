import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { ResponseWrapper } from '../../libs/response';
import { JwtUtility } from '../../libs/jwt/jwt.utility';
import { ClientsService } from '../clients/clients.service';
import { Client } from '../clients/client.schema';
import { ClientSignInDto } from './dto/client-sign-in.dto';

type ClientDocument = Client & {
  _id: { toString(): string };
  toObject?: () => Client & { _id: { toString(): string } };
};

type ClientSignInResult = {
  token: string;
  client: {
    id: string;
    username: string;
  };
};

type AuthorizedClientResult = {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(private readonly clientService: ClientsService) {}

  public async signInClient(dto: ClientSignInDto): Promise<ClientSignInResult> {
    const client = await this.clientService.findByUsername(dto.username);

    if (!client || !(await compare(dto.password, client.password))) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Invalid username or password'),
      );
    }

    const document = client as ClientDocument;
    const data = document.toObject?.() ?? document;
    const id = data._id.toString();
    const token = JwtUtility.generateAccessToken(id, 'client');

    return {
      token,
      client: {
        id,
        username: data.username,
      },
    };
  }

  public async getAuthorizedClient(
    authHeader: string | undefined,
    cookieHeader: string | undefined,
  ): Promise<AuthorizedClientResult | null> {
    const id = authHeader?.startsWith('Bearer ')
      ? await JwtUtility.clientIdFromHeader(authHeader)
      : await JwtUtility.clientIdFromCookieHeader(cookieHeader);

    if (!id) {
      return null;
    }

    const client = await this.clientService.findById(id);

    if (!client) {
      return null;
    }

    const document = client as ClientDocument;
    const data = document.toObject?.() ?? document;

    return {
      id: data._id.toString(),
      username: data.username,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
