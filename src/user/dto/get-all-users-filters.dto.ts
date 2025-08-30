import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationFilterDto } from '../../common/dto/pagination';
import { SortOrderEnum } from '../../common/enums';
import { UserSortByEnum } from '../enums';

// Utility function for boolean transformation
const toBoolean = (value: string | boolean): boolean => {
  if (value === 'true' || value === true) {
    return true;
  }
  if (value === 'false' || value === false) {
    return false;
  }
  return Boolean(value);
};

export class GetAllUsersFilterDto extends PaginationFilterDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  status: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  isBlocked: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAt: string;

  @ApiPropertyOptional({ enum: SortOrderEnum })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  order: SortOrderEnum;

  @ApiPropertyOptional({
    enum: UserSortByEnum,
    default: UserSortByEnum.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(UserSortByEnum)
  sortBy: UserSortByEnum;
}
