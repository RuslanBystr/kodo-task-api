import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ActivityDto {
  @ApiProperty()
  @IsNotEmpty()
  @Transform((userId) => Number(userId))
  @IsInt()
  userId: number;
}
