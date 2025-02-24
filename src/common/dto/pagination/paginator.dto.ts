import { ApiProperty } from '@nestjs/swagger';

class PaginatorMeta {
  @ApiProperty()
  totalItems: number;
  @ApiProperty()
  itemCount: number;
  @ApiProperty()
  itemsPerPage: number;
  @ApiProperty()
  totalPages: number;
  @ApiProperty()
  currentPage: number;
}

export class Paginator {
  @ApiProperty({ type: PaginatorMeta })
  meta: PaginatorMeta;
}
