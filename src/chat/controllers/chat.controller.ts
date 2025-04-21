import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { GetAllChatsFilterDto } from '../dto/get-all-chats-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatMemberGuard } from '../../message/guards/chat-member.guard';

@ApiTags('chat')
@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('/:id')
  getUserChatData(chatId: number) {
    return this.chatService.getChatData(chatId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserChats(@Query() filterDto: GetAllChatsFilterDto) {
    return this.chatService.getUserChats(filterDto);
  }

  @Get('groups')
  @UseGuards(JwtAuthGuard)
  getUserGroupChats(@Query() filterDto: GetAllChatsFilterDto) {
    return this.chatService.getUserGroupChats(filterDto);
  }

  @Post('private')
  @UseGuards(JwtAuthGuard)
  createPrivateChat(@Body() dto: { user1Id: number; user2Id: number }) {
    return this.chatService.createPrivateChat(dto.user1Id, dto.user2Id);
  }

  @Post('group')
  @UseGuards(JwtAuthGuard)
  createGroupChat(@Body() dto: { userIds: number[]; name: string }) {
    return this.chatService.createGroupChat(dto.userIds, dto.name);
  }
  @Delete('/:chatId')
  @UseGuards(JwtAuthGuard, ChatMemberGuard)
  async deletePrivateChat(@Param('chatId') id: number) {
    return this.chatService.deletePrivateChat(id);
  }
}
