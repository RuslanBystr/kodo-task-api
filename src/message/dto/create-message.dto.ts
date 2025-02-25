import { ApiProperty } from "@nestjs/swagger";

export class CreateMessageDto {
    @ApiProperty()
    content: string;

    @ApiProperty()
    senderId: number;

    @ApiProperty()
    receiverId: number;
}
