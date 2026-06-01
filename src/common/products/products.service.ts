import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongooseService } from '../../services/mongoose';
import { Product, ProductSchema } from './product.schema';

@Injectable()
export class ProductsService {
  private productModel: Model<Product> | null = null;

  constructor(private readonly mongooseService: MongooseService) {}

  public async find(): Promise<Product[]> {
    return this.mongooseService.find(this.model);
  }

  public async findByCategoryId(categoryId: string): Promise<Product[]> {
    return this.mongooseService.find(this.model, { categoryId });
  }

  public async findById(id: string): Promise<Product | null> {
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
