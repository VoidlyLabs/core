import { Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Configuration } from '../../admin/configuration/configuration.schema';
import { ConfigurationService } from '../../admin/configuration/configuration.service';
import { CommonController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';

type ConfigurationResponse = {
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
  public async find() {
    const configuration = await this.configurationService.get();

    return ResponseWrapper.from(this.serialize(configuration));
  }

  private serialize(configuration: Configuration): ConfigurationResponse {
    return {
      name: configuration.name,
      description: configuration.description,
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
