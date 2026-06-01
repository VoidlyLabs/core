import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { Model, UpdateQuery } from 'mongoose';
import { Product, ProductSchema } from '../../common/products/product.schema';
import { MongooseService } from '../../services/mongoose';
import { StorageService } from '../../services/storage';

type ProductImageFile = {
  originalname: string;
  buffer: Buffer;
};

type CreateProductData = Pick<
  Product,
  'categoryId' | 'name' | 'description' | 'price'
> &
  Partial<Pick<Product, 'isAvailable'>>;

type UpdateProductData = Partial<
  Pick<Product, 'categoryId' | 'name' | 'description' | 'price' | 'isAvailable'>
>;

@Injectable()
export class ProductsService {
  private static readonly IMAGE_KEY_PREFIX = 'products';
  private productModel: Model<Product> | null = null;

  constructor(
    private readonly mongooseService: MongooseService,
    private readonly storageService: StorageService,
  ) {}

  public async find(): Promise<Product[]> {
    return this.mongooseService.find(this.model);
  }

  public async findById(id: string): Promise<Product | null> {
    return this.mongooseService.findById(this.model, id);
  }

  public async findByCategoryId(categoryId: string): Promise<Product[]> {
    return this.mongooseService.find(this.model, { categoryId });
  }

  public async create(data: CreateProductData): Promise<Product> {
    return this.mongooseService.create(this.model, data);
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
      update.categoryId = data.categoryId;
    }

    if (typeof data.description === 'string') {
      update.description = data.description;
    }

    if (typeof data.price === 'number') {
      update.price = data.price;
    }

    if (typeof data.isAvailable === 'boolean') {
      update.isAvailable = data.isAvailable;
    }

    return this.mongooseService.updateOne(this.model, { _id: id }, update);
  }

  public async updateImage(
    id: string,
    file: ProductImageFile,
  ): Promise<Product | null> {
    const product = await this.findById(id);

    if (!product) {
      return null;
    }

    const oldImageKey = this.imageUrlToKey(product.imageUrl);
    const extension = extname(file.originalname).toLowerCase();
    const imageKey = `${ProductsService.IMAGE_KEY_PREFIX}/${id}/image${extension}`;
    const storedImage = await this.storageService.saveImage({
      key: imageKey,
      body: file.buffer,
    });

    if (oldImageKey && oldImageKey !== imageKey) {
      await this.storageService.deleteImage(oldImageKey);
    }

    return this.mongooseService.updateOne(
      this.model,
      { _id: id },
      {
        imageUrl: storedImage.url,
      },
    );
  }

  public async deleteImage(id: string): Promise<Product | null> {
    const product = await this.findById(id);

    if (!product) {
      return null;
    }

    const imageKey = this.imageUrlToKey(product.imageUrl);

    if (imageKey) {
      await this.storageService.deleteImage(imageKey);
    }

    return this.mongooseService.updateOne(
      this.model,
      { _id: id },
      {
        imageUrl: '',
      },
    );
  }

  public async deleteById(id: string): Promise<boolean> {
    const product = await this.findById(id);

    if (!product) {
      return false;
    }

    const deleted = await this.mongooseService.deleteById(this.model, id);

    if (!deleted) {
      return false;
    }

    const imageKey = this.imageUrlToKey(product.imageUrl);

    if (imageKey) {
      await this.storageService.deleteImage(imageKey);
    }

    return true;
  }

  private imageUrlToKey(imageUrl: string): string | null {
    if (!imageUrl) {
      return null;
    }

    const path = this.getImagePath(imageUrl);
    const publicPath = this.storageService.getPublicPath();

    if (!path.startsWith(`${publicPath}/`)) {
      return null;
    }

    return decodeURIComponent(path.slice(publicPath.length + 1));
  }

  private getImagePath(imageUrl: string): string {
    try {
      return new URL(imageUrl).pathname;
    } catch {
      return imageUrl;
    }
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
