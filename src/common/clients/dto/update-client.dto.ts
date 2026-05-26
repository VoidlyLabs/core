import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class UpdateClientDto {
  @ApiProperty()
  @IsString()
  username: string;

  @IsMongoId()
  id: string;
}
