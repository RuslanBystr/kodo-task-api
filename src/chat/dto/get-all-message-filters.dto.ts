import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationFilterDto } from '../../common/dto/pagination/pagination-filters.dto';
import { Type } from 'class-transformer';

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
