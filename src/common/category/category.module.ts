import { Module } from '@nestjs/common';
import { CategoryModule as AdminCategoryModule } from '../../admin/category/category.module';
import { ProductsModule } from '../products/products.module';
import { CategoryController } from './category.controller';

@Module({
  imports: [AdminCategoryModule, ProductsModule],
  controllers: [CategoryController],
})
export class CategoryModule {}
