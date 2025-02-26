import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from '../services/chat.service';

@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('private')
  createPrivateChat(@Body() dto: { user1Id: number; user2Id: number }) {
    return this.chatService.createPrivateChat(dto.user1Id, dto.user2Id);
  }

  @Post('group')
  createGroupChat(@Body() dto: { userIds: number[]; name: string }) {
    return this.chatService.createGroupChat(dto.userIds, dto.name);
  }

  @Get(':userId')
  getUserChats(@Param('userId') userId: number) {
    return this.chatService.getUserChats(userId);
  }
}
