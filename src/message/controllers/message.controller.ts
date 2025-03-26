import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  BadRequestException,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetAllMessageFilterDto } from '../dto/get-all-message-filters.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatMemberGuard } from '../guards/chat-member.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('message')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @UseGuards(JwtAuthGuard, ChatMemberGuard)
  async getMessages(
    @Query('chatId') chatId: string,
    @Query() filterDto: GetAllMessageFilterDto,
  ) {
    if (!chatId) {
      throw new BadRequestException('chatId is required');
    }
    return this.messageService.getMessages({ chatId, ...filterDto });
  }

  @Post('/send')
  @UseGuards(JwtAuthGuard, ChatMemberGuard)
  async sendMessage(@Body() body: CreateMessageDto) {
    return this.messageService.sendMessage(body);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, ChatMemberGuard)
  async reactionOnMessage(
    @Param('id') id: number,
    @Body('reaction') reaction: string,
  ) {
    return this.messageService.addReactionOnMessage(id, reaction);
  }

  @Delete('/:chatId')
  @UseGuards(JwtAuthGuard, ChatMemberGuard)
  async removeMessage(@Param('chatId') id: number) {
    return this.messageService.removeMessage(id);
  }
}
