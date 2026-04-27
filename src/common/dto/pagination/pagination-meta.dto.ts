import { ApiProperty } from '@nestjs/swagger';
import { IPaginationMeta } from 'nestjs-typeorm-paginate/dist/interfaces';

export class PaginationMetaDto implements IPaginationMeta {
  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  totalItems?: number;

  @ApiProperty()
  totalPages?: number;
}
