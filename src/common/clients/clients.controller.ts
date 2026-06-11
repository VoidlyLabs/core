import { Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { JwtUtility } from '../../libs/jwt/jwt.utility';
import { ResponseWrapper } from '../../libs/response';
import { MongoDocument } from '../../services/mongoose';
import { Client } from './client.schema';
import { ClientsService } from './clients.service';

type ClientResponse = {
  id: string;
  username: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

@ApiTags('Clients')
@CommonController('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Current client details' })
  public async me(@Req() request: Request) {
    const id = request.headers.authorization?.startsWith('Bearer ')
      ? await JwtUtility.clientIdFromHeader(request.headers.authorization)
      : await JwtUtility.clientIdFromCookieHeader(request.headers.cookie);

    if (!id) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Unauthorized'),
      );
    }

    const client = await this.clientsService.findById(id);

    if (!client) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Unauthorized'),
      );
    }

    return ResponseWrapper.from(client);
  }
}
