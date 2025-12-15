import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailResponseDto {
  @ApiProperty()
  email: string;
}
