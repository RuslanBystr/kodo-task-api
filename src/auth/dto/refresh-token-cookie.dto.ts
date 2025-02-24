import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenCookieDto {
  @ApiProperty()
  cookie: string;

  @ApiProperty()
  token: string;
}
