import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialLocalizedStringDto } from '../../../libs/localization';

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
