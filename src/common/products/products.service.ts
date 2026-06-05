import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoDocument, MongooseService } from '../../services/mongoose';
import { Product, ProductSchema } from './product.schema';

@Injectable()
export class ProductsService {
  private productModel: Model<Product> | null = null;

  constructor(private readonly mongooseService: MongooseService) {}

  public async find(): Promise<Array<MongoDocument<Product>>> {
    return this.mongooseService.find(this.model);
  }

  public async findByCategoryId(
    categoryId: string,
  ): Promise<Array<MongoDocument<Product>>> {
    return this.mongooseService.find(this.model, { categoryId });
  }

  public async findById(id: string): Promise<MongoDocument<Product> | null> {
    return this.mongooseService.findById(this.model, id);
  }

  private get model(): Model<Product> {
    this.productModel ??= this.mongooseService.getModel(
      'Product',
      ProductSchema,
      {
        collection: 'products',
      },
    );

    return this.productModel;
  }
}
