import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { CommonModule } from './common/common.module';
import { MongooseModule } from './services/mongoose';
import { StorageModule } from './services/storage';
import { BootstrapModule } from './bootstrap/bootstrap.module';

@Module({
  imports: [
    MongooseModule,
    StorageModule,
    CommonModule,
    AdminModule,
    BootstrapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
