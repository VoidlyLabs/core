import {
  Body,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { Client } from './client.schema';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

type ClientResponse = {
  id: string;
  username: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

type ClientDocument = Client & {
  _id: { toString(): string };
  toObject?: () => Client & { _id: { toString(): string } };
};

@ApiTags('Clients')
@CommonController('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOkResponse({ description: 'Clients list' })
  public async find() {
    const clients = await this.clientsService.find();

    return ResponseWrapper.from(
      clients.map((client) => this.serialize(client)),
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Client details' })
  public async findById(@Param('id') id: string) {
    const client = await this.clientsService.findById(id);

    if (!client) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(this.serialize(client));
  }

  @Post()
  @ApiCreatedResponse({ description: 'Client created' })
  public async create(@Body() dto: CreateClientDto) {
    const client = await this.clientsService.create(dto);

    return ResponseWrapper.from(this.serialize(client), false, 'Created');
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Client updated' })
  public async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    const client = await this.clientsService.update(id, dto);

    if (!client) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(this.serialize(client));
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Client deleted' })
  public async deleteById(@Param('id') id: string) {
    const deleted = await this.clientsService.deleteById(id);

    if (!deleted) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from({ deleted });
  }

  private serialize(client: Client): ClientResponse {
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
}
