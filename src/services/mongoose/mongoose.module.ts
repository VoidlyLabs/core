import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigUtility } from '../../libs/config/config.utility';
import { MongooseService } from './mongoose.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [ConfigUtility, MongooseService],
  exports: [MongooseService],
})
export class MongooseModule {}
