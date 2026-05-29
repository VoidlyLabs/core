import { Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Category } from '../../admin/category/category.schema';
import { CategoryService } from '../../admin/category/category.service';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { Product } from '../products/product.schema';
import { ProductsService } from '../products/products.service';

type ProductResponse = {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryResponse = {
  id: string;
  name: string;
  products: ProductResponse[];
  createdAt: Date;
  updatedAt: Date;
};

type CategoryListItemResponse = Omit<CategoryResponse, 'products'>;

type CategoryDocument = Category & {
  _id: { toString(): string };
  toObject?: () => Category & { _id: { toString(): string } };
};

type ProductDocument = Product & {
  _id: { toString(): string };
  toObject?: () => Product & { _id: { toString(): string } };
};

@ApiTags('Category')
@CommonController('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Categories list' })
  public async find() {
    const categories = await this.categoryService.find();

    return ResponseWrapper.from(
      categories.map((category) => this.serializeListItem(category)),
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Category details with products' })
  public async findById(@Param('id') id: string) {
    const category = await this.categoryService.findById(id);

    if (!category) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    const products = await this.productsService.findByCategoryId(id);

    return ResponseWrapper.from(this.serialize(category, products));
  }

  private serialize(category: Category, products: Product[]): CategoryResponse {
    const document = category as CategoryDocument;
    const data = document.toObject?.() ?? document;

    return {
      id: data._id.toString(),
      name: data.name,
      products: products.map((product) => this.serializeProduct(product)),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private serializeListItem(category: Category): CategoryListItemResponse {
    const document = category as CategoryDocument;
    const data = document.toObject?.() ?? document;

    return {
      id: data._id.toString(),
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private serializeProduct(product: Product): ProductResponse {
    const document = product as ProductDocument;
    const data = document.toObject?.() ?? document;

    return {
      id: data._id.toString(),
      name: data.name,
      categoryId: data.categoryId.toString(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
