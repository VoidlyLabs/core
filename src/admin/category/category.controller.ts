import {
  Body,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Category')
@AdminController('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ description: 'Categories list' })
  public async find() {
    const categories = await this.categoryService.find();

    return ResponseWrapper.from(categories);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Categories list' })
  public async findById(@Param('id') id: string) {
    const categories = await this.categoryService.findById(id);

    return ResponseWrapper.from(categories);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Category created' })
  public async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoryService.create(dto);

    return ResponseWrapper.from(category, false, 'Created');
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Category updated' })
  public async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.categoryService.update(id, dto);

    if (!category) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(category);
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
}
