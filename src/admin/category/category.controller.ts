import {
  Body,
  Delete,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { MongoDocument } from '../../services/mongoose';
import { Category } from './category.schema';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type CategoryResponse = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

@ApiTags('Category')
@AdminController('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Category created' })
  public async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoryService.create(dto);

    return ResponseWrapper.from(this.serialize(category), false, 'Created');
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Category updated' })
  public async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.categoryService.update(id, dto);

    if (!category) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(this.serialize(category));
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Category deleted' })
  public async deleteById(@Param('id') id: string) {
    const deleted = await this.categoryService.deleteById(id);

    if (!deleted) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from({ deleted });
  }

  private serialize(category: MongoDocument<Category>): CategoryResponse {
    return {
      id: category._id.toString(),
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
