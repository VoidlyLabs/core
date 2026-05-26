import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  Connection,
  ConnectionStates,
  Model,
  Mongoose,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Schema,
  UpdateQuery,
} from 'mongoose';
import { ConfigUtility } from '../../utility/config/config.utility';

type ModelOptions = {
  collection?: string;
};

@Injectable()
export class MongooseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongooseService.name);
  private readonly mongoose = new Mongoose();
  private connection: Connection | null = null;

  constructor(private readonly configUtility: ConfigUtility) {}

  public async onModuleInit(): Promise<void> {
    await this.connect();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  public async connect(
    uri = this.configUtility.get('MONGODB_URI'),
  ): Promise<Connection> {
    if (this.connection?.readyState === ConnectionStates.connected) {
      return this.connection;
    }

    await this.mongoose.connect(uri);
    this.connection = this.mongoose.connection;
    this.logger.log('MongoDB connection established');

    return this.connection;
  }

  public async disconnect(): Promise<void> {
    if (
      !this.connection ||
      this.connection.readyState === ConnectionStates.disconnected
    ) {
      return;
    }

    await this.mongoose.disconnect();
    this.connection = null;
    this.logger.log('MongoDB connection closed');
  }

  public getConnection(): Connection {
    if (
      !this.connection ||
      this.connection.readyState !== ConnectionStates.connected
    ) {
      throw new InternalServerErrorException('MongoDB connection is not ready');
    }

    return this.connection;
  }

  public getModel<T>(
    name: string,
    schema: Schema<T>,
    options: ModelOptions = {},
  ): Model<T> {
    const connection = this.getConnection();

    if (connection.models[name]) {
      return connection.models[name] as Model<T>;
    }

    return connection.model<T>(name, schema, options.collection);
  }

  public async find<T>(
    model: Model<T>,
    filter: QueryFilter<T> = {},
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T[]> {
    return model.find(filter, projection, options).exec();
  }

  public async findOne<T>(
    model: Model<T>,
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return model.findOne(filter, projection, options).exec();
  }

  public async findById<T>(
    model: Model<T>,
    id: string,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return model.findById(id, projection, options).exec();
  }

  public async create<T>(model: Model<T>, data: Partial<T>): Promise<T> {
    return model.create(data);
  }

  public async updateOne<T>(
    model: Model<T>,
    filter: QueryFilter<T>,
    data: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return model
      .findOneAndUpdate(filter, data, { new: true, ...options })
      .exec();
  }

  public async deleteOne<T>(
    model: Model<T>,
    filter: QueryFilter<T>,
  ): Promise<boolean> {
    const result = await model.deleteOne(filter).exec();

    return result.deletedCount > 0;
  }

  public async deleteById<T>(model: Model<T>, id: string): Promise<boolean> {
    const result = await model.findByIdAndDelete(id).exec();

    return Boolean(result);
  }
}
