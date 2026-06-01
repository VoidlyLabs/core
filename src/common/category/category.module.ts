import { Module } from '@nestjs/common';
import { CategoryModule as AdminCategoryModule } from '../../admin/category/category.module';
import { CategoryController } from './category.controller';

@Module({
  imports: [AdminCategoryModule],
  controllers: [CategoryController],
})
export class CategoryModule {}
