import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SetTimeDto {
  @Type(() => Number)
  @IsNumber()
  duration: number;
}
