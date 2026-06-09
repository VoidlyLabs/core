import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { PartialLocalizedStringDto } from '../../../libs/localization';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ type: PartialLocalizedStringDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PartialLocalizedStringDto)
  name?: PartialLocalizedStringDto;
}
