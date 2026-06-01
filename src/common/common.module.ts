import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ClientsModule } from './clients/clients.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
    ProductsModule,
    CategoryModule,
    ConfigurationModule,
  ],
})
export class CommonModule {}
