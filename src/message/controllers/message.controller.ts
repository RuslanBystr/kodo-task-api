import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { User } from '../../user/entities/user.entity';
import { CreateMessageDto } from "../dto/create-message.dto";

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('/send')
  async sendMessage(
    @Body() body: CreateMessageDto,
  ) {
    const sender = new User();
    sender.id = body.senderId;

    const receiver = new User();
    receiver.id = body.receiverId;

    return this.messageService.sendMessage(body.content, sender, receiver);
  }

  @Get('/:senderId/:receiverId')
  async getMessages(
    @Param('senderId') senderId: number,
    @Param('receiverId') receiverId: number,
  ) {
    return this.messageService.getMessages(senderId, receiverId);
  }
}
