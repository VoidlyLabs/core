import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigUtility } from '../../libs/config/config.utility';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigUtility],
  exports: [UsersService],
})
export class UsersModule {}
