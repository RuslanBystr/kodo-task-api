import { ApiProperty } from '@nestjs/swagger';
import { RegisterResponseDto } from './register-response.dto';
import { RefreshTokenCookieDto } from '../refresh-token-cookie.dto';

export class LoginResponseDto extends RegisterResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshTokenCookie: RefreshTokenCookieDto;
}
