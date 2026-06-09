import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ConfigUtility } from '../../libs/config/config.utility';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ConfigUtility],
  exports: [ClientsService],
})
export class ClientsModule {}
