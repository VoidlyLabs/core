import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { ConfigUtility } from '../../libs/config/config.utility';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, ConfigUtility],
  exports: [AuthService],
})
export class AuthModule {}
