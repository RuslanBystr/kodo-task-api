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
import { LLMService } from '../services/llm.service';
import { GenerateTextApiDocs } from '../docs/api-generate.decorator';
import { JwtAuthGuard } from '../../auth/guards';
import { ChatWithThreadDto } from '../dto/chat-with-thread.dto';
import { ChatWithThreadApiDocs } from '../docs/api-chat-with-thread.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatHistoryQueryDto } from '../dto/chat-history-query.dto';
import { ChatHistoryApiDocs } from '../docs/api-chat-history.decorator';
import { FindThreadsQueryDto } from '../dto/find-all-threads.dto';
import { FindThreadsApiDocs } from '../docs/api-find-threads.decorator';
import { DeleteThreadApiDocs } from '../docs/api-delete-thread.decorator';
import { CreateThreadDto } from '../dto/create-thread.dto';

@Controller('llm')
@ApiBearerAuth('access_token')
export class LLMController {
  constructor(private llmService: LLMService) {}

  @Post('generate')
  @GenerateTextApiDocs()
  async generate(@Body('prompt') prompt: string): Promise<any> {
    if (!prompt) {
      return { error: 'Prompt is required.' };
    }
    const text = await this.llmService.generateText(prompt);
    return { generatedText: text };
  }

  @Get('chat')
  @UseGuards(JwtAuthGuard)
  @ChatHistoryApiDocs()
  async getChat(@Query() q: ChatHistoryQueryDto, @Req() req: any) {
    const userId: string = req.user?.id ?? req.user?.userId;
    return this.llmService.getChatHistory({
      userId,
      threadId: q.threadId,
      limit: q.limit,
      before: q.before,
    });
  }

  @Get('threads')
  @UseGuards(JwtAuthGuard)
  @FindThreadsApiDocs()
  async findAllThreads(@Query() q: FindThreadsQueryDto, @Req() req: any) {
    const userId: string = req.user?.id ?? req.user?.userId;
    return this.llmService.findAllThreads({
      userId,
      offset: q.offset,
      limit: q.limit,
      q: q.q,
    });
  }

  @Post('threads')
  @UseGuards(JwtAuthGuard)
  async createThread(@Body() dto: CreateThreadDto, @Req() req: any) {
    const userId: string = req.user?.id ?? req.user?.userId;
    const t = await this.llmService.createThread({
      userId,
      title: dto.title,
      systemPrompt: dto.systemPrompt,
    });
    return { threadId: String(t.id), title: t.title, created_at: t.created_at };
  }

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ChatWithThreadApiDocs()
  async chat(@Body() dto: ChatWithThreadDto, @Req() req: any) {
    const userId: string = req.user?.id ?? req.user?.userId;
    const { reply, threadId } = await this.llmService.chatWithThread({
      userId,
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
  async deleteThread(@Param('id') id: string, @Req() req: any) {
    const userId: string = req.user?.id ?? req.user?.userId;
    await this.llmService.deleteThread({ userId, threadId: id });
  }
}
