import { Injectable } from '@nestjs/common';
import { Model, UpdateQuery } from 'mongoose';
import { MongoDocument, MongooseService } from '../../services/mongoose';
import { Category, CategorySchema } from './category.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CategoryService {
  private categoryModel: Model<Category> | null = null;

  constructor(
    private readonly mongooseService: MongooseService,
    private readonly productsService: ProductsService,
  ) {}

  public async find(): Promise<Array<MongoDocument<Category>>> {
    return this.mongooseService.find(this.model);
  }

  public async create(
    data: Pick<Category, 'name'>,
  ): Promise<MongoDocument<Category>> {
    return this.mongooseService.create(this.model, data);
  }

  public async findById(id: string): Promise<MongoDocument<Category> | null> {
    return this.mongooseService.findById(this.model, id);
  }

  public async update(
    id: string,
    data: Pick<UpdateQuery<Category>, 'name'>,
  ): Promise<MongoDocument<Category> | null> {
    return this.mongooseService.updateOne(this.model, { _id: id }, data);
  }

  public async deleteById(id: string): Promise<boolean> {
    const category = await this.findById(id);

    if (!category) {
      return false;
    }

    const products = await this.productsService.findByCategoryId(id);

    await Promise.all(
      products.map(async (product) => {
        try {
          await this.productsService.deleteById(product._id.toString());

          console.log(
            `Product ${product._id.toString()} deleted successfully.`,
          );
        } catch (error) {
          console.error(error);
        }
      }),
    );

    return this.mongooseService.deleteById(this.model, id);
  }

  private get model(): Model<Category> {
    this.categoryModel ??= this.mongooseService.getModel(
      'Category',
      CategorySchema,
      {
        collection: 'categories',
      },
    );

    return this.categoryModel;
  }
}
