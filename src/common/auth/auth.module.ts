import { Module } from '@nestjs/common';
import { ClientsService as AdminClientsService } from '../../admin/clients/clients.service';
import { ConfigUtility } from '../../libs/config/config.utility';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AdminClientsService, ConfigUtility],
  exports: [AuthService],
})
export class AuthModule {}
