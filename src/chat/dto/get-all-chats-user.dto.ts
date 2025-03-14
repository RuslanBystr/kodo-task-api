import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationFilterDto } from '../../common/dto/pagination/pagination-filters.dto';
import { Type } from 'class-transformer';

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
