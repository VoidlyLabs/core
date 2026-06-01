import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsHexColor,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class UpdateConfigurationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

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
