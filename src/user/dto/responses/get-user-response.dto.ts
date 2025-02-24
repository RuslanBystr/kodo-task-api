import { ApiProperty } from '@nestjs/swagger';
import { FileEntity } from '../../../file/entities/file.entity';

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
  avatar: FileEntity;

  @ApiProperty()
  createdAt: Date;
}
