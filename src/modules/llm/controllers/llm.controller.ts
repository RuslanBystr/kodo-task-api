import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/guards';
import {
  ChatHistoryApiDocs,
  ChatWithThreadApiDocs,
  DeleteThreadApiDocs,
  FindThreadsApiDocs,
  GenerateTextApiDocs,
} from '../docs';
import { ChatHistoryQueryDto } from '../dto/chat-history-query.dto';
import { ChatWithThreadDto } from '../dto/chat-with-thread.dto';
import { CreateThreadDto } from '../dto/create-thread.dto';
import { FindThreadsQueryDto } from '../dto/find-all-threads.dto';
import { LLMService } from '../services/llm.service';

@Controller('llm')
@ApiBearerAuth('access_token')
export class LLMController {
  constructor(private llmService: LLMService) {}

  @Post('generate')
  @GenerateTextApiDocs()
  async generate(@Body('prompt') prompt: string) {
    if (!prompt) {
      return { error: 'Prompt is required.' };
    }
    const text = await this.llmService.generateText(prompt);
    return { generatedText: text };
  }

  @Get('chat')
  @UseGuards(JwtAuthGuard)
  @ChatHistoryApiDocs()
  async getChat(@Query() q: ChatHistoryQueryDto, @Req() req: Request) {
    return this.llmService.getChatHistory({
      userId: req.user.id.toString(),
      threadId: q.threadId,
      limit: q.limit,
      before: q.before,
    });
  }

  @Get('threads')
  @UseGuards(JwtAuthGuard)
  @FindThreadsApiDocs()
  async findAllThreads(@Query() q: FindThreadsQueryDto, @Req() req: Request) {
    return this.llmService.findAllThreads({
      userId: req.user?.id.toString(),
      offset: q.offset,
      limit: q.limit,
      q: q.q,
    });
  }

  @Post('threads')
  @UseGuards(JwtAuthGuard)
  async createThread(@Body() dto: CreateThreadDto, @Req() req: Request) {
    const t = await this.llmService.createThread({
      userId: req.user?.id.toString(),
      title: dto.title,
      systemPrompt: dto.systemPrompt,
    });
    return { threadId: String(t.id), title: t.title, created_at: t.created_at };
  }

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ChatWithThreadApiDocs()
  async chat(@Body() dto: ChatWithThreadDto, @Req() req: Request) {
    const { reply, threadId } = await this.llmService.chatWithThread({
      userId: req.user.id,
      prompt: dto.prompt,
      threadId: dto.threadId,
      systemPrompt: dto.systemPrompt,
    });
    return { reply, threadId };
  }

  @Delete('threads/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @DeleteThreadApiDocs()
  async deleteThread(@Param('id') id: string, @Req() req: Request) {
    const userId: number = req.user?.id ?? req.user?.id;
    await this.llmService.deleteThread({ userId, threadId: id });
  }
}
