import {
  BadRequestException,
  Body,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { LocalizedString } from '../../libs/localization';
import { MongoDocument } from '../../services/mongoose';
import { Product } from '../../common/products/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

type ProductResponse = {
  id: string;
  categoryId: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

type UploadedProductImageFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@ApiTags('Products')
@AdminController('products')
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

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['image'],
    },
  })
  @ApiCreatedResponse({ description: 'Product image uploaded' })
  public async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file?: UploadedProductImageFile,
  ) {
    if (!file) {
      throw new BadRequestException(
        ResponseWrapper.from({}, true, 'Image is required'),
      );
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        ResponseWrapper.from({}, true, 'File must be an image'),
      );
    }

    const product = await this.productsService.updateImage(id, file);

    if (!product) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

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

  @Delete(':id/image')
  @ApiOkResponse({ description: 'Product image deleted' })
  public async deleteImage(@Param('id') id: string) {
    const product = await this.productsService.deleteImage(id);

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

  private serialize(product: MongoDocument<Product>): ProductResponse {
    return {
      id: product._id.toString(),
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price,
      isAvailable: product.isAvailable,
      imageUrl: product.imageUrl ?? '',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
