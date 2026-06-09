import {
  BadRequestException,
  Body,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { MongoDocument } from '../../services/mongoose';
import { AuthService } from '../auth/auth.service';
import { ClientsService } from '../clients/clients.service';
import { Order } from '../orders/order.schema';
import { OrdersService } from '../orders/orders.service';
import { PurchaseProductDto } from './dto/purchase-product.dto';
import { ProductsService } from './products.service';

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
  public async find(
    @Query('lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const products = await this.productsService.findLocalized(
      lang,
      acceptLanguage,
    );

    return ResponseWrapper.from(products);
  }

  @Get('category/:categoryId')
  @ApiOkResponse({ description: 'Products list by category' })
  public async findByCategoryId(
    @Param('categoryId') categoryId: string,
    @Query('lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const products = await this.productsService.findByCategoryIdLocalized(
      categoryId,
      lang,
      acceptLanguage,
    );

    return ResponseWrapper.from(products);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Product details' })
  public async findById(
    @Param('id') id: string,
    @Query('lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const product = await this.productsService.findByIdLocalized(
      id,
      lang,
      acceptLanguage,
    );

    if (!product) {
      throw new NotFoundException(ResponseWrapper.from({}, true, 'Not found'));
    }

    return ResponseWrapper.from(product);
  }

  @Post('purchase')
  @ApiCreatedResponse({ description: 'Product order created' })
  public async purchase(
    @Body() dto: PurchaseProductDto,
    @Req() request: Request,
    @Query('lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
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

    if (!product.isAvailable) {
      throw new BadRequestException(
        ResponseWrapper.from({}, true, 'Product is not available'),
      );
    }

    const totalPrice = product.price * dto.quantity;

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

    let order: MongoDocument<Order>;

    try {
      order = await this.ordersService.create({
        clientId: client.id,
        productId: product._id.toString(),
        product: this.productsService.toOrderSnapshot(
          product,
          lang,
          acceptLanguage,
        ),
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

  private serializeOrder(order: MongoDocument<Order>): OrderResponse {
    return {
      id: order._id.toString(),
      clientId: order.clientId,
      productId: order.productId,
      product: order.product,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
