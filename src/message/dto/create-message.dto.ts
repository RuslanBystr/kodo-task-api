import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  chatId: number;

  @ApiProperty()
  senderId: number;

  @ApiProperty()
  content: string;
}
