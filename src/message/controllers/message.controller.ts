import { Controller, Post, Body, Param, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetAllMessageFilterDto } from '../dto/get-all-message-filters.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatMemberGuard } from '../guards/chat-member.guard';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @UseGuards(JwtAuthGuard, ChatMemberGuard)
  async getMessages(
    @Query('chatId') chatId: string,
    @Query() filterDto: GetAllMessageFilterDto
  ) {
    if (!chatId) {
      throw new BadRequestException('chatId is required');
    }
    return this.messageService.getMessages({ chatId, ...filterDto });
  }

  @Post('/send')
  async sendMessage(@Body() body: CreateMessageDto) {
    return this.messageService.sendMessage(body);
  }
}
