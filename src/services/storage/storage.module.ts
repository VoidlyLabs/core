import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigUtility } from '../../libs/config/config.utility';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [ConfigUtility, StorageService],
  exports: [StorageService],
})
export class StorageModule {}
