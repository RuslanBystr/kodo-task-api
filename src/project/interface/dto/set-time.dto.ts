import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SetTimeDto {
  @Type(() => Number)
  @IsNumber()
  duration: number;
}
