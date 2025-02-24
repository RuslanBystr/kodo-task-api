import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class PaginationFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  limit: number;
}
