import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Injectable()
export class ConfigUtility {
  constructor(private readonly configService: ConfigService) {}

  public get(name: string): string {
    return this.configService.getOrThrow<string>(name);
  }
}
