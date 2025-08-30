import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

import { PaginationFilterDto } from '../../common/dto/pagination';

export class GetAllChatsFilterDto extends PaginationFilterDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;
}
