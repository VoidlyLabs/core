import { Module } from '@nestjs/common';
import { UsersModule } from '../admin/users/users.module';
import { ConfigUtility } from '../libs/config/config.utility';
import { InitialUserService } from './initial-user.service';

@Module({
  imports: [UsersModule],
  providers: [ConfigUtility, InitialUserService],
})
export class BootstrapModule {}
