import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { Model, UpdateQuery } from 'mongoose';
import {
  LocalizedString,
  PartialLocalizedStringDto,
} from '../../libs/localization';
import { MongoDocument, MongooseService } from '../../services/mongoose';
import { StorageService } from '../../services/storage';
import { Configuration, ConfigurationSchema } from './configuration.schema';

type LogoFile = {
  originalname: string;
  buffer: Buffer;
};

type ConfigurationUpdate = Partial<
  Pick<
    Configuration,
    | 'logoUrl'
    | 'accentColor'
    | 'backgroundColor'
    | 'secondaryColor'
    | 'phoneNumber'
    | 'email'
  >
> & {
  name?: PartialLocalizedStringDto;
  description?: PartialLocalizedStringDto;
};

type ConfigurationScalarField =
  | 'logoUrl'
  | 'accentColor'
  | 'backgroundColor'
  | 'secondaryColor'
  | 'phoneNumber'
  | 'email';

type ConfigurationLocalizedField = 'name' | 'description';

@Injectable()
export class ConfigurationService {
  private static readonly SINGLETON_FILTER = {};
  private static readonly LOGO_KEY_PREFIX = 'configuration/logo';
  private configurationModel: Model<Configuration> | null = null;

  constructor(
    private readonly mongooseService: MongooseService,
    private readonly storageService: StorageService,
  ) {}

  public async get(): Promise<MongoDocument<Configuration>> {
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
    data: Omit<ConfigurationUpdate, 'logoUrl'>,
  ): Promise<MongoDocument<Configuration>> {
    return this.upsert(data);
  }

  public async updateLogo(
    file: LogoFile,
  ): Promise<MongoDocument<Configuration>> {
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

  public async deleteLogo(): Promise<MongoDocument<Configuration>> {
    const configuration = await this.get();
    const logoKey = this.logoUrlToKey(configuration.logoUrl);

    if (logoKey) {
      await this.storageService.deleteImage(logoKey);
    }

    return this.upsert({ logoUrl: '' });
  }

  private async upsert(
    data: ConfigurationUpdate,
  ): Promise<MongoDocument<Configuration>> {
    const update = this.buildUpdate(data);
    const setOnInsert = this.getInsertDefaults(update);
    const configuration = await this.mongooseService.updateOne(
      this.model,
      ConfigurationService.SINGLETON_FILTER,
      { $set: update, $setOnInsert: setOnInsert },
      { upsert: true },
    );

    return configuration ?? (await this.get());
  }

  private buildUpdate(data: ConfigurationUpdate): UpdateQuery<Configuration> {
    const update: UpdateQuery<Configuration> = {};
    const scalarFields: ConfigurationScalarField[] = [
      'logoUrl',
      'accentColor',
      'backgroundColor',
      'secondaryColor',
      'phoneNumber',
      'email',
    ];

    this.applyLocalizedUpdate(update, 'name', data.name);
    this.applyLocalizedUpdate(update, 'description', data.description);

    for (const field of scalarFields) {
      if (typeof data[field] === 'string') {
        update[field] = data[field];
      }
    }

    return update;
  }

  private applyLocalizedUpdate(
    update: UpdateQuery<Configuration>,
    field: ConfigurationLocalizedField,
    value?: PartialLocalizedStringDto,
  ): void {
    if (!value) {
      return;
    }

    if (typeof value.uk === 'string') {
      update[`${field}.uk`] = value.uk;
    }

    if (typeof value.en === 'string') {
      update[`${field}.en`] = value.en;
    }
  }

  private getInsertDefaults(
    update: UpdateQuery<Configuration>,
  ): Partial<Configuration> {
    const defaults: Partial<Configuration> = { ...this.defaultConfiguration };

    for (const key of Object.keys(update)) {
      delete defaults[key.split('.')[0] as keyof Configuration];
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
      name: this.emptyLocalizedString,
      description: this.emptyLocalizedString,
      logoUrl: '',
      accentColor: '',
      backgroundColor: '',
      secondaryColor: '',
      phoneNumber: '',
      email: '',
    };
  }

  private get emptyLocalizedString(): LocalizedString {
    return {
      uk: '',
      en: '',
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
