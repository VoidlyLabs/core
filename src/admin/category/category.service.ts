import { Injectable } from '@nestjs/common';
import { Model, UpdateQuery } from 'mongoose';
import {
  localize,
  PartialLocalizedStringDto,
  resolveLanguage,
} from '../../libs/localization';
import { MongoDocument, MongooseService } from '../../services/mongoose';
import { Category, CategorySchema } from './category.schema';
import { ProductsService } from '../products/products.service';
import { CreateCategoryDto } from './dto/create-category.dto';

type UpdateCategoryData = {
  name?: PartialLocalizedStringDto;
};

export type LocalizedCategory = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

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

  public async findLocalized(
    lang?: string,
    acceptLanguage?: string,
  ): Promise<Array<LocalizedCategory>> {
    const language = resolveLanguage(lang, acceptLanguage);
    const categories = await this.find();

    return categories.map((category) =>
      this.localizeCategory(category, language),
    );
  }

  public async create(
    data: CreateCategoryDto,
  ): Promise<MongoDocument<Category>> {
    return this.mongooseService.create(this.model, data);
  }

  public async findById(id: string): Promise<MongoDocument<Category> | null> {
    return this.mongooseService.findById(this.model, id);
  }

  public async findByIdLocalized(
    id: string,
    lang?: string,
    acceptLanguage?: string,
  ): Promise<LocalizedCategory | null> {
    const category = await this.findById(id);

    if (!category) {
      return null;
    }

    return this.localizeCategory(
      category,
      resolveLanguage(lang, acceptLanguage),
    );
  }

  public async update(
    id: string,
    data: UpdateCategoryData,
  ): Promise<MongoDocument<Category> | null> {
    const update: UpdateQuery<Category> = {};

    if (typeof data.name?.uk === 'string') {
      update['name.uk'] = data.name.uk;
    }

    if (typeof data.name?.en === 'string') {
      update['name.en'] = data.name.en;
    }

    return this.mongooseService.updateOne(this.model, { _id: id }, update);
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

  private localizeCategory(
    category: MongoDocument<Category>,
    language: ReturnType<typeof resolveLanguage>,
  ): LocalizedCategory {
    return {
      id: category._id.toString(),
      name: localize(category.name, language),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
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
