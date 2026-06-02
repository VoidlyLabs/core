import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcryptjs';
import { ResponseWrapper } from '../../libs/response';
import { JwtUtility } from '../../libs/jwt/jwt.utility';
import { ClientsService } from '../clients/clients.service';
import { Client } from '../clients/client.schema';
import { ClientSignInDto } from './dto/client-sign-in.dto';
import { ClientSignUpDto } from './dto/client-sign-up.dto';

type ClientDocument = Client & {
  _id: { toString(): string };
  toObject?: () => Client & { _id: { toString(): string } };
};

type ClientSignInResult = {
  token: string;
  client: {
    id: string;
    username: string;
    balance: number;
  };
};

type AuthorizedClientResult = {
  id: string;
  username: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(private readonly clientService: ClientsService) {}

  public async signUpClient(dto: ClientSignUpDto): Promise<ClientSignInResult> {
    const existingClient = await this.clientService.findByUsername(
      dto.username,
    );

    if (existingClient) {
      throw new ConflictException(
        ResponseWrapper.from({}, true, 'Username already exists'),
      );
    }

    try {
      const client = await this.clientService.create(dto);

      return this.authorizeClient(client);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          ResponseWrapper.from({}, true, 'Username already exists'),
        );
      }

      throw error;
    }
  }

  public async signInClient(dto: ClientSignInDto): Promise<ClientSignInResult> {
    const client = await this.clientService.findByUsername(dto.username);

    if (!client || !(await compare(dto.password, client.password))) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Invalid username or password'),
      );
    }

    return this.authorizeClient(client);
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
      balance: data.balance ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private authorizeClient(client: Client): ClientSignInResult {
    const document = client as ClientDocument;
    const data = document.toObject?.() ?? document;
    const id = data._id.toString();
    const token = JwtUtility.generateAccessToken(id, 'client');

    return {
      token,
      client: {
        id,
        username: data.username,
        balance: data.balance ?? 0,
      },
    };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }
}
