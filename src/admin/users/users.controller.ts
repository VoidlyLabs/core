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
import { AdminController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { User } from './user.schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserResponse = {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

type UserDocument = User & {
  _id: { toString(): string };
  toObject?: () => User & { _id: { toString(): string } };
};

@ApiTags('Users')
@AdminController('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ description: 'Users list' })
  public async find() {
    const clients = await this.usersService.find();

    return ResponseWrapper.from(
      clients.map((client) => this.serialize(client)),
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Client details' })
  public async findById(@Param('id') id: string) {
    const client = await this.usersService.findById(id);

    if (!client) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(this.serialize(client));
  }

  @Post()
  @ApiCreatedResponse({ description: 'Client created' })
  public async create(@Body() dto: CreateUserDto) {
    const client = await this.usersService.create(dto);

    return ResponseWrapper.from(this.serialize(client), false, 'Created');
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Client updated' })
  public async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const client = await this.usersService.update(id, dto);

    if (!client) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(this.serialize(client));
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Client deleted' })
  public async deleteById(@Param('id') id: string) {
    const deleted = await this.usersService.deleteById(id);

    if (!deleted) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from({ deleted });
  }

  private serialize(client: User): UserResponse {
    const document = client as UserDocument;
    const data = document.toObject?.() ?? document;

    return {
      id: data._id.toString(),
      username: data.username,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
