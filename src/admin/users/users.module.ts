import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigUtility } from '../../utility/config/config.utility';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigUtility],
  exports: [UsersService],
})
export class UsersModule {}
