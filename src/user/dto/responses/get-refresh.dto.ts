import { ApiProperty } from '@nestjs/swagger';

export class GetRefreshDto {
  @ApiProperty()
  token: string;
}
