import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  username: string;

  @IsMongoId()
  id: string;
}
