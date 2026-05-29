import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { Model, QueryFilter, UpdateQuery } from 'mongoose';
import { MongooseService } from '../../services/mongoose';
import { User, UserSchema } from './user.schema';
import { ConfigUtility } from '../../utility/config/config.utility';

@Injectable()
export class UsersService {
  private userModel: Model<User> | null = null;
  private readonly PASSWORD_SALT_ROUNDS: number;

  constructor(
    private readonly mongooseService: MongooseService,
    private readonly configUtility: ConfigUtility,
  ) {
    this.PASSWORD_SALT_ROUNDS = Number(
      this.configUtility.get('PASSWORD_SALT_ROUNDS'),
    );
  }

  public async find(filter: QueryFilter<User> = {}): Promise<User[]> {
    return this.mongooseService.find(this.model, filter);
  }

  public async findOne(filter: QueryFilter<User>): Promise<User | null> {
    return this.mongooseService.findOne(this.model, filter);
  }

  public async findById(id: string): Promise<User | null> {
    return this.mongooseService.findById(this.model, id);
  }

  public async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username });
  }

  public async create(
    data: Pick<User, 'username' | 'password'>,
  ): Promise<User> {
    return this.mongooseService.create(this.model, {
      ...data,
      password: await hash(data.password, this.PASSWORD_SALT_ROUNDS),
    });
  }

  public async update(
    id: string,
    data: UpdateQuery<User>,
  ): Promise<User | null> {
    const update = { ...data };

    if (typeof update.password === 'string') {
      update.password = await hash(update.password, this.PASSWORD_SALT_ROUNDS);
    }

    return this.mongooseService.updateOne(this.model, { _id: id }, update);
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.mongooseService.deleteById(this.model, id);
  }

  private get model(): Model<User> {
    this.userModel ??= this.mongooseService.getModel('User', UserSchema, {
      collection: 'users',
    });

    return this.userModel;
  }
}
