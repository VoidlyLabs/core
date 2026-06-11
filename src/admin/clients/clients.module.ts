import { Module } from '@nestjs/common';
import { ConfigUtility } from '../../libs/config/config.utility';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ConfigUtility],
})
export class ClientsModule {}
