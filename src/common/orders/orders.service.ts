import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoDocument, MongooseService } from '../../services/mongoose';
import { Order, OrderSchema } from './order.schema';

type CreateOrderData = Pick<
  Order,
  'clientId' | 'productId' | 'product' | 'quantity' | 'totalPrice'
> &
  Partial<Pick<Order, 'status'>>;

@Injectable()
export class OrdersService {
  private orderModel: Model<Order> | null = null;

  constructor(private readonly mongooseService: MongooseService) {}

  public async create(data: CreateOrderData): Promise<MongoDocument<Order>> {
    return this.mongooseService.create(this.model, data);
  }

  private get model(): Model<Order> {
    this.orderModel ??= this.mongooseService.getModel('Order', OrderSchema, {
      collection: 'orders',
    });

    return this.orderModel;
  }
}
