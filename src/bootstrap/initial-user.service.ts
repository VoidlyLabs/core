import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsersService } from '../admin/users/users.service';
import { MongooseService } from '../services/mongoose';
import { ConfigUtility } from '../libs/config/config.utility';
import {
  BootstrapMarker,
  BootstrapMarkerSchema,
} from './bootstrap-marker.schema';

const INITIAL_USER_MARKER = 'initial-user-created';

@Injectable()
export class InitialUserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitialUserService.name);
  private markerModel: Model<BootstrapMarker> | null = null;

  constructor(
    private readonly usersService: UsersService,
    private readonly mongooseService: MongooseService,
    private readonly configUtility: ConfigUtility,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    const marker = await this.model
      .findOne({ name: INITIAL_USER_MARKER })
      .exec();

    if (marker) {
      return;
    }

    const username =
      this.configUtility.getOptional('INITIAL_USER_USERNAME') ?? 'admin';
    const password =
      this.configUtility.getOptional('INITIAL_USER_PASSWORD') ?? 'admin12345';
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      await this.usersService.create({ username, password });
      this.logger.log(`Initial user "${username}" created`);
    } else {
      this.logger.log(`Initial user "${username}" already exists`);
    }

    await this.model.create({ name: INITIAL_USER_MARKER });
  }

  private get model(): Model<BootstrapMarker> {
    this.markerModel ??= this.mongooseService.getModel(
      'BootstrapMarker',
      BootstrapMarkerSchema,
      { collection: 'bootstrap_markers' },
    );

    return this.markerModel;
  }
}
