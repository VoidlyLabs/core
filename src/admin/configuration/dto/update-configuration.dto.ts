import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsHexColor,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { PartialLocalizedStringDto } from '../../../libs/localization';

export class UpdateConfigurationDto {
  @ApiPropertyOptional({ type: PartialLocalizedStringDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PartialLocalizedStringDto)
  name?: PartialLocalizedStringDto;

  @ApiPropertyOptional({ type: PartialLocalizedStringDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PartialLocalizedStringDto)
  description?: PartialLocalizedStringDto;

  @ApiPropertyOptional({ example: '#ff6600' })
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsHexColor()
  accentColor?: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsHexColor()
  backgroundColor?: string;

  @ApiPropertyOptional({ example: '#111827' })
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'info@example.com' })
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsEmail()
  email?: string;
}
