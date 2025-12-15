import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

import { PaginationFilterDto } from '../../../common/dto/pagination/pagination-filters.dto';

export class GetAllMessageFilterDto extends PaginationFilterDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  chatId: number;
}
