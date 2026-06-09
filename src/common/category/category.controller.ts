import { Get, Headers, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from '../../admin/category/category.service';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';

@ApiTags('Category')
@CommonController('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ description: 'Categories list' })
  public async find(
    @Query('lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const categories = await this.categoryService.findLocalized(
      lang,
      acceptLanguage,
    );

    return ResponseWrapper.from(categories);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Category details' })
  public async findById(
    @Param('id') id: string,
    @Query('lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const category = await this.categoryService.findByIdLocalized(
      id,
      lang,
      acceptLanguage,
    );

    if (!category) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(category);
  }
}
