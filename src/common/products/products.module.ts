import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [AuthModule, ClientsModule, OrdersModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
