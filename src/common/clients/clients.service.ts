import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoDocument, MongooseService } from '../../services/mongoose';
import { Client, ClientSchema } from './client.schema';

@Injectable()
export class ClientsService {
  private clientModel: Model<Client> | null = null;

  constructor(private readonly mongooseService: MongooseService) {}

  public async findById(id: string): Promise<MongoDocument<Client> | null> {
    return this.mongooseService.findById(this.model, id);
  }

  public async debitBalanceIfSufficient(
    id: string,
    amount: number,
  ): Promise<MongoDocument<Client> | null> {
    return this.mongooseService.updateOne(
      this.model,
      {
        _id: id,
        balance: { $gte: amount },
      },
      {
        $inc: {
          balance: -amount,
        },
      },
    );
  }

  public async incrementBalance(
    id: string,
    amount: number,
  ): Promise<MongoDocument<Client> | null> {
    return this.mongooseService.updateOne(
      this.model,
      {
        _id: id,
      },
      {
        $inc: {
          balance: amount,
        },
      },
    );
  }

  private get model(): Model<Client> {
    this.clientModel ??= this.mongooseService.getModel('Client', ClientSchema, {
      collection: 'clients',
    });

    return this.clientModel;
  }
}
