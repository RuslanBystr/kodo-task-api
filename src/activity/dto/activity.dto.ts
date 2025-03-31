import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ActivityDto {
  @ApiProperty()
  @IsNotEmpty()
  @Transform((userId) => Number(userId))
  @IsInt()
  userId: number;
}
