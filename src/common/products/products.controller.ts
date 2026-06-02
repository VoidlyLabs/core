import {
  BadRequestException,
  Body,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { AuthService } from '../auth/auth.service';
import { ClientsService } from '../clients/clients.service';
import { Order } from '../orders/order.schema';
import { OrdersService } from '../orders/orders.service';
import { PurchaseProductDto } from './dto/purchase-product.dto';
import { Product } from './product.schema';
import { ProductsService } from './products.service';

type ProductResponse = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProductDocument = Product & {
  _id: { toString(): string };
  toObject?: () => Product & { _id: { toString(): string } };
};

type OrderResponse = {
  id: string;
  clientId: string;
  productId: string;
  product: {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  };
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type OrderDocument = Order & {
  _id: { toString(): string };
  toObject?: () => Order & { _id: { toString(): string } };
};

@ApiTags('Products')
@CommonController('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService,
    private readonly clientsService: ClientsService,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Products list' })
  public async find() {
    const products = await this.productsService.find();

    return ResponseWrapper.from(
      products.map((product) => this.serialize(product)),
    );
  }

  @Get('category/:categoryId')
  @ApiOkResponse({ description: 'Products list by category' })
  public async findByCategoryId(@Param('categoryId') categoryId: string) {
    const products = await this.productsService.findByCategoryId(categoryId);

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

  @Post('purchase')
  @ApiCreatedResponse({ description: 'Product order created' })
  public async purchase(
    @Body() dto: PurchaseProductDto,
    @Req() request: Request,
  ) {
    const client = await this.authService.getAuthorizedClient(
      request.headers.authorization,
      request.headers.cookie,
    );

    if (!client) {
      throw new UnauthorizedException(
        ResponseWrapper.from({}, true, 'Unauthorized'),
      );
    }

    const product = await this.productsService.findById(dto.productId);

    if (!product) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    const productData = this.productData(product);

    if (!productData.isAvailable) {
      throw new BadRequestException(
        ResponseWrapper.from({}, true, 'Product is not available'),
      );
    }

    const totalPrice = productData.price * dto.quantity;

    if (totalPrice > 0) {
      const debitedClient = await this.clientsService.debitBalanceIfSufficient(
        client.id,
        totalPrice,
      );

      if (!debitedClient) {
        throw new BadRequestException(
          ResponseWrapper.from({}, true, 'Insufficient balance'),
        );
      }
    }

    let order: Order;

    try {
      order = await this.ordersService.create({
        clientId: client.id,
        productId: productData._id.toString(),
        product: {
          id: productData._id.toString(),
          categoryId: productData.categoryId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          imageUrl: productData.imageUrl ?? '',
        },
        quantity: dto.quantity,
        totalPrice,
        status: 'pending',
      });
    } catch (error) {
      if (totalPrice > 0) {
        await this.clientsService
          .incrementBalance(client.id, totalPrice)
          .catch(() => undefined);
      }

      throw error;
    }

    return ResponseWrapper.from(this.serializeOrder(order), false, 'Created');
  }

  private serialize(product: Product): ProductResponse {
    const data = this.productData(product);

    return {
      id: data._id.toString(),
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      isAvailable: data.isAvailable,
      imageUrl: data.imageUrl ?? '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private serializeOrder(order: Order): OrderResponse {
    const document = order as OrderDocument;
    const data = document.toObject?.() ?? document;

    return {
      id: data._id.toString(),
      clientId: data.clientId,
      productId: data.productId,
      product: data.product,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private productData(
    product: Product,
  ): Product & { _id: { toString(): string } } {
    const document = product as ProductDocument;

    return document.toObject?.() ?? document;
  }
}
