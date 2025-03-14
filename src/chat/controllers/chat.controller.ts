import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { GetAllChatsFilterDto } from '../dto/get-all-chats-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('chat')
@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  getUserChats(@Query() filterDto: GetAllChatsFilterDto) {
    return this.chatService.getUserChats(filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('private')
  createPrivateChat(@Body() dto: { user1Id: number; user2Id: number }) {
    return this.chatService.createPrivateChat(dto.user1Id, dto.user2Id);
  }

  @Post('group')
  createGroupChat(@Body() dto: { userIds: number[]; name: string }) {
    return this.chatService.createGroupChat(dto.userIds, dto.name);
  }
}
