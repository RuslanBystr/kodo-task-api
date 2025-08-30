import { ApiProperty } from '@nestjs/swagger';

import { RefreshTokenCookieDto } from '../refresh-token-cookie.dto';
import { RegisterResponseDto } from './register-response.dto';

export class LoginResponseDto extends RegisterResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshTokenCookie: RefreshTokenCookieDto;
}
