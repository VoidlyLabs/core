import { Module } from '@nestjs/common';
import { ConfigurationService } from '../../admin/configuration/configuration.service';
import { ConfigurationController } from './configuration.controller';

@Module({
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
