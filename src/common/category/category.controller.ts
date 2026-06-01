import { Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Category } from '../../admin/category/category.schema';
import { CategoryService } from '../../admin/category/category.service';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';

type CategoryResponse = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryDocument = Category & {
  _id: { toString(): string };
  toObject?: () => Category & { _id: { toString(): string } };
};

@ApiTags('Category')
@CommonController('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ description: 'Categories list' })
  public async find() {
    const categories = await this.categoryService.find();

    return ResponseWrapper.from(
      categories.map((category) => this.serialize(category)),
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Category details' })
  public async findById(@Param('id') id: string) {
    const category = await this.categoryService.findById(id);

    if (!category) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(this.serialize(category));
  }

  private serialize(category: Category): CategoryResponse {
    const document = category as CategoryDocument;
    const data = document.toObject?.() ?? document;

    return {
      id: data._id.toString(),
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
