import { Injectable } from '@nestjs/common';
import { Model, Types, UpdateQuery } from 'mongoose';
import { MongooseService } from '../../services/mongoose';
import { Product, ProductSchema } from './product.schema';

type CreateProductData = {
  name: string;
  categoryId: string;
};

type UpdateProductData = {
  name?: string;
  categoryId?: string;
};

@Injectable()
export class ProductsService {
  private productModel: Model<Product> | null = null;

  constructor(private readonly mongooseService: MongooseService) {}

  public async find(): Promise<Product[]> {
    return this.mongooseService.find(this.model);
  }

  public async findByCategoryId(categoryId: string): Promise<Product[]> {
    return this.mongooseService.find(this.model, {
      categoryId: new Types.ObjectId(categoryId),
    });
  }

  public async findById(id: string): Promise<Product | null> {
    return this.mongooseService.findById(this.model, id);
  }

  public async create(data: CreateProductData): Promise<Product> {
    return this.mongooseService.create(this.model, {
      name: data.name,
      categoryId: new Types.ObjectId(data.categoryId),
    });
  }

  public async update(
    id: string,
    data: UpdateProductData,
  ): Promise<Product | null> {
    const update: UpdateQuery<Product> = {};

    if (typeof data.name === 'string') {
      update.name = data.name;
    }

    if (typeof data.categoryId === 'string') {
      update.categoryId = new Types.ObjectId(data.categoryId);
    }

    return this.mongooseService.updateOne(this.model, { _id: id }, update);
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.mongooseService.deleteById(this.model, id);
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
