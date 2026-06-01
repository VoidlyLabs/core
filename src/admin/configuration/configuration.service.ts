import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { Model } from 'mongoose';
import { MongooseService } from '../../services/mongoose';
import { StorageService } from '../../services/storage';
import { Configuration, ConfigurationSchema } from './configuration.schema';

type LogoFile = {
  originalname: string;
  buffer: Buffer;
};

type ConfigurationUpdate = Partial<
  Pick<
    Configuration,
    | 'name'
    | 'description'
    | 'logoUrl'
    | 'accentColor'
    | 'backgroundColor'
    | 'secondaryColor'
    | 'phoneNumber'
    | 'email'
  >
>;

@Injectable()
export class ConfigurationService {
  private static readonly SINGLETON_FILTER = {};
  private static readonly LOGO_KEY_PREFIX = 'configuration/logo';
  private configurationModel: Model<Configuration> | null = null;

  constructor(
    private readonly mongooseService: MongooseService,
    private readonly storageService: StorageService,
  ) {}

  public async get(): Promise<Configuration> {
    const configuration = await this.mongooseService.findOne(
      this.model,
      ConfigurationService.SINGLETON_FILTER,
    );

    if (configuration) {
      return configuration;
    }

    return this.mongooseService.create(this.model, this.defaultConfiguration);
  }

  public async update(
    data: Partial<
      Pick<
        Configuration,
        | 'name'
        | 'description'
        | 'accentColor'
        | 'backgroundColor'
        | 'secondaryColor'
        | 'phoneNumber'
        | 'email'
      >
    >,
  ): Promise<Configuration> {
    return this.upsert(data);
  }

  public async updateLogo(file: LogoFile): Promise<Configuration> {
    const configuration = await this.get();
    const oldLogoKey = this.logoUrlToKey(configuration.logoUrl);
    const extension = extname(file.originalname).toLowerCase();
    const logoKey = `${ConfigurationService.LOGO_KEY_PREFIX}${extension}`;
    const storedLogo = await this.storageService.saveImage({
      key: logoKey,
      body: file.buffer,
    });

    if (oldLogoKey && oldLogoKey !== logoKey) {
      await this.storageService.deleteImage(oldLogoKey);
    }

    return this.upsert({ logoUrl: storedLogo.url });
  }

  public async deleteLogo(): Promise<Configuration> {
    const configuration = await this.get();
    const logoKey = this.logoUrlToKey(configuration.logoUrl);

    if (logoKey) {
      await this.storageService.deleteImage(logoKey);
    }

    return this.upsert({ logoUrl: '' });
  }

  private async upsert(data: ConfigurationUpdate): Promise<Configuration> {
    const setOnInsert = this.getInsertDefaults(data);
    const configuration = await this.mongooseService.updateOne(
      this.model,
      ConfigurationService.SINGLETON_FILTER,
      { $set: data, $setOnInsert: setOnInsert },
      { upsert: true },
    );

    return configuration ?? (await this.get());
  }

  private getInsertDefaults(data: ConfigurationUpdate): ConfigurationUpdate {
    const defaults: ConfigurationUpdate = { ...this.defaultConfiguration };

    for (const key of Object.keys(data) as Array<keyof ConfigurationUpdate>) {
      delete defaults[key];
    }

    return defaults;
  }

  private logoUrlToKey(logoUrl: string): string | null {
    if (!logoUrl) {
      return null;
    }

    const path = this.getLogoPath(logoUrl);
    const publicPath = this.storageService.getPublicPath();

    if (!path.startsWith(`${publicPath}/`)) {
      return null;
    }

    return decodeURIComponent(path.slice(publicPath.length + 1));
  }

  private getLogoPath(logoUrl: string): string {
    try {
      return new URL(logoUrl).pathname;
    } catch {
      return logoUrl;
    }
  }

  private get defaultConfiguration(): Pick<
    Configuration,
    | 'name'
    | 'description'
    | 'logoUrl'
    | 'accentColor'
    | 'backgroundColor'
    | 'secondaryColor'
    | 'phoneNumber'
    | 'email'
  > {
    return {
      name: '',
      description: '',
      logoUrl: '',
      accentColor: '',
      backgroundColor: '',
      secondaryColor: '',
      phoneNumber: '',
      email: '',
    };
  }

  private get model(): Model<Configuration> {
    this.configurationModel ??= this.mongooseService.getModel(
      'Configuration',
      ConfigurationSchema,
      {
        collection: 'configuration',
      },
    );

    return this.configurationModel;
  }
}
