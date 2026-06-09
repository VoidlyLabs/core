import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigUtility } from '../../libs/config/config.utility';

@Module({
  imports: [ClientsModule],
  controllers: [AuthController],
  providers: [AuthService, ConfigUtility],
  exports: [AuthService],
})
export class AuthModule {}
