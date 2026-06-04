import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ProductsService } from '../products/products.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ProductsService],
  exports: [CategoryService],
})
export class CategoryModule {}
