import { Get, Headers, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Configuration } from '../../admin/configuration/configuration.schema';
import { ConfigurationService } from '../../admin/configuration/configuration.service';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { localize, resolveLanguage } from '../../libs/localization';
import { ResponseWrapper } from '../../libs/response';
import { MongoDocument } from '../../services/mongoose';

type ConfigurationResponse = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  accentColor: string;
  backgroundColor: string;
  secondaryColor: string;
  phoneNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

@ApiTags('Configuration')
@CommonController('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get()
  @ApiOkResponse({ description: 'Configuration details' })
  public async find(
    @Query('lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const configuration = await this.configurationService.get();

    return ResponseWrapper.from(
      this.serialize(configuration, lang, acceptLanguage),
    );
  }

  private serialize(
    configuration: MongoDocument<Configuration>,
    lang?: string,
    acceptLanguage?: string,
  ): ConfigurationResponse {
    const language = resolveLanguage(lang, acceptLanguage);

    return {
      id: configuration._id.toString(),
      name: localize(configuration.name, language),
      description: localize(configuration.description, language),
      logoUrl: configuration.logoUrl,
      accentColor: configuration.accentColor,
      backgroundColor: configuration.backgroundColor,
      secondaryColor: configuration.secondaryColor,
      phoneNumber: configuration.phoneNumber,
      email: configuration.email,
      createdAt: configuration.createdAt,
      updatedAt: configuration.updatedAt,
    };
  }
}
