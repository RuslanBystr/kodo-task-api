import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDto } from '../../../common/dto/pagination';
import { GetUserResponseDto } from './get-user-response.dto';

export class UserGetAllResponseDto {
  @ApiProperty({ isArray: true, type: GetUserResponseDto })
  items: GetUserResponseDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}
