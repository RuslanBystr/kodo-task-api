import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrderEnum } from '../../common/enums/sort-order.enum';
import { PaginationFilterDto } from '../../common/dto/pagination/pagination-filters.dto';
import { Type } from 'class-transformer';
import { TaskStatusEnum } from '../enums/task-status';

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
