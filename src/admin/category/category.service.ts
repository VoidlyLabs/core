import { Injectable } from '@nestjs/common';
import { Model, UpdateQuery } from 'mongoose';
import { MongooseService } from '../../services/mongoose';
import { Category, CategorySchema } from './category.schema';

@Injectable()
export class CategoryService {
  private categoryModel: Model<Category> | null = null;

  constructor(private readonly mongooseService: MongooseService) {}

  public async find(): Promise<Category[]> {
    return this.mongooseService.find(this.model);
  }

  public async create(data: Pick<Category, 'name'>): Promise<Category> {
    return this.mongooseService.create(this.model, data);
  }

  public async findById(id: string): Promise<Category | null> {
    return this.mongooseService.findById(this.model, id);
  }

  public async update(
    id: string,
    data: Pick<UpdateQuery<Category>, 'name'>,
  ): Promise<Category | null> {
    return this.mongooseService.updateOne(this.model, { _id: id }, data);
  }

  public async deleteById(id: string): Promise<boolean> {
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
