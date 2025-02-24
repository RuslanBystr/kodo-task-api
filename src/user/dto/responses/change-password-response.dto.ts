import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordResponseDto {
  @ApiProperty({ default: 'Password was changed successfully' })
  message: string;
}
