import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationFilterDto } from '../../../common/dto/pagination';
import { SortOrderEnum } from '../../../common/enums';
import { TaskStatusEnum } from '../../domain';

export class GetAllProjectsFilterDto extends PaginationFilterDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAt: string;

  @ApiPropertyOptional({ enum: TaskStatusEnum })
  @IsOptional()
  @IsEnum(TaskStatusEnum)
  status: TaskStatusEnum;

  @ApiPropertyOptional({ enum: SortOrderEnum })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  order: SortOrderEnum;

  @ApiPropertyOptional()
  @IsOptional()
  sortBy: string;
}
