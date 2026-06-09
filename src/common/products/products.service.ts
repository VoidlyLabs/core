import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { localize, resolveLanguage } from '../../libs/localization';
import { MongoDocument, MongooseService } from '../../services/mongoose';
import { OrderProductSnapshot } from '../orders/order.schema';
import { Product, ProductSchema } from './product.schema';

export type LocalizedProduct = {
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

@Injectable()
export class ProductsService {
  private productModel: Model<Product> | null = null;

  constructor(private readonly mongooseService: MongooseService) {}

  public async find(): Promise<Array<MongoDocument<Product>>> {
    return this.mongooseService.find(this.model);
  }

  public async findLocalized(
    lang?: string,
    acceptLanguage?: string,
  ): Promise<Array<LocalizedProduct>> {
    const language = resolveLanguage(lang, acceptLanguage);
    const products = await this.find();

    return products.map((product) => this.localizeProduct(product, language));
  }

  public async findByCategoryId(
    categoryId: string,
  ): Promise<Array<MongoDocument<Product>>> {
    return this.mongooseService.find(this.model, { categoryId });
  }

  public async findByCategoryIdLocalized(
    categoryId: string,
    lang?: string,
    acceptLanguage?: string,
  ): Promise<Array<LocalizedProduct>> {
    const language = resolveLanguage(lang, acceptLanguage);
    const products = await this.findByCategoryId(categoryId);

    return products.map((product) => this.localizeProduct(product, language));
  }

  public async findById(id: string): Promise<MongoDocument<Product> | null> {
    return this.mongooseService.findById(this.model, id);
  }

  public async findByIdLocalized(
    id: string,
    lang?: string,
    acceptLanguage?: string,
  ): Promise<LocalizedProduct | null> {
    const product = await this.findById(id);

    if (!product) {
      return null;
    }

    return this.localizeProduct(product, resolveLanguage(lang, acceptLanguage));
  }

  public toOrderSnapshot(
    product: MongoDocument<Product>,
    lang?: string,
    acceptLanguage?: string,
  ): OrderProductSnapshot {
    const language = resolveLanguage(lang, acceptLanguage);

    return {
      id: product._id.toString(),
      categoryId: product.categoryId,
      name: localize(product.name, language),
      description: localize(product.description, language),
      price: product.price,
      imageUrl: product.imageUrl ?? '',
    };
  }

  private localizeProduct(
    product: MongoDocument<Product>,
    language: ReturnType<typeof resolveLanguage>,
  ): LocalizedProduct {
    return {
      id: product._id.toString(),
      categoryId: product.categoryId,
      name: localize(product.name, language),
      description: localize(product.description, language),
      price: product.price,
      isAvailable: product.isAvailable,
      imageUrl: product.imageUrl ?? '',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
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
