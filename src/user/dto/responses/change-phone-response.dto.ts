import { ApiProperty } from '@nestjs/swagger';

export class ChangePhoneResponseDto {
  @ApiProperty()
  phone: string;
}
