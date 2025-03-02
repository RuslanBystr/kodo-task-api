import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetAllMessageFilterDto } from '../dto/get-all-message-filters.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async getMessages(@Query() filterDto: GetAllMessageFilterDto) {
    return this.messageService.getMessages(filterDto);
  }

  @Post('/send')
  async sendMessage(@Body() body: CreateMessageDto) {
    return this.messageService.sendMessage(body);
  }
}
