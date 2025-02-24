import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({ default: 'Reset password email has been sent successfully' })
  message: string;
}
