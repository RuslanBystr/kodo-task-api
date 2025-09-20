import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/guards';
import { CreateMessageDto, GetAllMessageFilterDto } from '../dto';
import { ChatMemberGuard } from '../guards';
import { MessageService } from '../services/message.service';

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
    @Req() req: Request,
  ) {
    return this.messageService.addReactionOnMessage(id, req.user.id, reaction);
  }

  @Delete('/:chatId')
  @UseGuards(JwtAuthGuard, ChatMemberGuard)
  async removeMessage(@Param('chatId') id: number) {
    return this.messageService.removeMessage(id);
  }
}
