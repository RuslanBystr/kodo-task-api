import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrderEnum } from '../../common/enums/sort-order.enum';
import { PaginationFilterDto } from '../../common/dto/pagination/pagination-filters.dto';
import { UserSortByEnum } from '../enums/user-sort.enum';
import { Type, Transform } from 'class-transformer';

// Utility function for boolean transformation
const toBoolean = (value: any): boolean => {
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
