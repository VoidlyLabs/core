import {
  BadRequestException,
  Body,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AdminController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { ClientsService } from './clients.service';
import { CreateAdminClientDto } from './dto/create-admin-client.dto';
import { UpdateAdminClientDto } from './dto/update-admin-client.dto';

@ApiTags('Clients')
@AdminController('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOkResponse({ description: 'Clients list' })
  public async find() {
    const clients = await this.clientsService.find();

    return ResponseWrapper.from(clients.map((client) => client));
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Client details' })
  public async findById(@Param('id') id: string) {
    this.assertObjectId(id);

    const client = await this.clientsService.findById(id);

    if (!client) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(client);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Client created' })
  public async create(@Body() dto: CreateAdminClientDto) {
    const client = await this.clientsService.create(dto);

    return ResponseWrapper.from(client, false, 'Created');
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Client updated' })
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminClientDto,
  ) {
    this.assertObjectId(id);

    const client = await this.clientsService.update(id, dto);

    if (!client) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(client);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Client deleted' })
  public async deleteById(@Param('id') id: string) {
    this.assertObjectId(id);

    const deleted = await this.clientsService.deleteById(id);

    if (!deleted) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from({ deleted });
  }

  private assertObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        ResponseWrapper.from({}, true, 'Invalid id'),
      );
    }
  }
}
