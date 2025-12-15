import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  createdAt: Date;
}
