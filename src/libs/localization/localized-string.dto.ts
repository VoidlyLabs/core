import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LocalizedStringDto {
  @ApiProperty({ example: 'Ukrainian name' })
  @IsString()
  uk: string;

  @ApiProperty({ example: 'English name' })
  @IsString()
  en: string;
}

export class PartialLocalizedStringDto {
  @ApiPropertyOptional({ example: 'Ukrainian name' })
  @IsOptional()
  @IsString()
  uk?: string;

  @ApiPropertyOptional({ example: 'English name' })
  @IsOptional()
  @IsString()
  en?: string;
}
