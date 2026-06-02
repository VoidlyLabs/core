import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateClientDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsMongoId()
  id: string;
}
