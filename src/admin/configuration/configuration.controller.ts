import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminController } from '../../decorators/controller/controller.decorator';
import { ResponseWrapper } from '../../libs/response';
import { Configuration } from './configuration.schema';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

type UploadedLogoFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@ApiTags('Configuration')
@AdminController('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get()
  @ApiOkResponse({ description: 'Configuration details' })
  public async find() {
    const configuration = await this.configurationService.get();

    return ResponseWrapper.from(configuration);
  }

  @Patch()
  @ApiOkResponse({ description: 'Configuration updated' })
  public async update(@Body() dto: UpdateConfigurationDto) {
    const configuration = await this.configurationService.update(dto);

    return ResponseWrapper.from(configuration);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['logo'],
    },
  })
  @ApiCreatedResponse({ description: 'Configuration logo uploaded' })
  public async uploadLogo(@UploadedFile() file?: UploadedLogoFile) {
    if (!file) {
      throw new BadRequestException(
        ResponseWrapper.from({}, true, 'Logo is required'),
      );
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        ResponseWrapper.from({}, true, 'Logo must be an image'),
      );
    }

    const configuration = await this.configurationService.updateLogo(file);

    return ResponseWrapper.from(configuration, false, 'Created');
  }

  @Delete('logo')
  @ApiOkResponse({ description: 'Configuration logo deleted' })
  public async deleteLogo() {
    const configuration = await this.configurationService.deleteLogo();

    return ResponseWrapper.from(configuration);
  }
}
