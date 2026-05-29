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
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.schema';
import { ProductsService } from './products.service';

type ProductResponse = {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProductDocument = Product & {
  _id: { toString(): string };
  toObject?: () => Product & { _id: { toString(): string } };
};

@ApiTags('Products')
@CommonController('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ description: 'Products list' })
  public async find() {
    const products = await this.productsService.find();

    return ResponseWrapper.from(
      products.map((product) => this.serialize(product)),
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Product details' })
  public async findById(@Param('id') id: string) {
    const product = await this.productsService.findById(id);

    if (!product) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(this.serialize(product));
  }

  @Post()
  @ApiCreatedResponse({ description: 'Product created' })
  public async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.create(dto);

    return ResponseWrapper.from(this.serialize(product), false, 'Created');
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Product updated' })
  public async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.update(id, dto);

    if (!product) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(this.serialize(product));
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Product deleted' })
  public async deleteById(@Param('id') id: string) {
    const deleted = await this.productsService.deleteById(id);

    if (!deleted) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from({ deleted });
  }

  private serialize(product: Product): ProductResponse {
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
