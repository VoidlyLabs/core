import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty({ minLength: 5 })
  @IsString()
  @MinLength(5)
  password: string;
}
