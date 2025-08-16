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
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { GetAllChatsFilterDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards';
import { ChatMemberGuard } from '../guards';
import { CreateGroupDto } from '../dto/create-group.dto';
import { AddGroupMemberDto } from '../dto/add-group-member.dto';

@ApiTags('chat')
@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

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
  createGroupChat(@Body() dto: CreateGroupDto) {
    console.log(dto);
    return this.chatService.createGroupChat(dto.userIds, dto.groupName);
  }

  @Post('group/member')
  @UseGuards(JwtAuthGuard)
  addGroupMember(@Body() dto: AddGroupMemberDto) {
    return this.chatService.addChatMembers(dto.chatId, dto.userId);
  }

  @Delete('/:chatId')
  @UseGuards(JwtAuthGuard, ChatMemberGuard)
  async deletePrivateChat(@Param('chatId') id: number) {
    return this.chatService.deletePrivateChat(id);
  }
}
