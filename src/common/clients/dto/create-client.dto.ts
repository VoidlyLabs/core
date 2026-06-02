import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty({ minLength: 5 })
  @IsString()
  @MinLength(5)
  password: string;

  @ApiProperty({ default: 0, minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;
}
