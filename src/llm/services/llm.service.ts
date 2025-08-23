import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Repository } from 'typeorm';
import { CONFIG } from '../../common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Threads } from '../entities/threads.entity';
import {
  MessageRole,
  ThreadMessages,
} from '../entities/thread-messages.entity';

@Injectable()
export class LLMService {
  private readonly gemini: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Threads)
    private readonly threadsRepo: Repository<Threads>,
    @InjectRepository(ThreadMessages)
    private readonly threadMessagesRepo: Repository<ThreadMessages>,
  ) {
    const apiKey = this.configService.get<string>(CONFIG.GEMINI_API_KEY);
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined in the environment variables.',
      );
    }

    this.gemini = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const model = this.gemini.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error while generating text:', error);
      throw new Error('Failed to generate text using Gemini API.');
    }
  }

  async createThread(params: {
    userId: string;
    title?: string | null;
    systemPrompt?: string | null;
  }) {
    let thread = this.threadsRepo.create({
      user_id: params.userId as any,
      title: params.title ?? null,
      system_prompt: params.systemPrompt ?? null,
      summary: null,
    });
    thread = await this.threadsRepo.save(thread);
    return thread;
  }

  async getChatHistory(params: {
    userId: string;
    threadId: string;
    limit?: number;
    before?: string;
  }): Promise<{
    threadId: string;
    items: Array<{
      id: string;
      role: string;
      content: string;
      created_at: Date;
    }>;
    nextCursor?: string;
  }> {
    const { userId, threadId } = params;
    const limit =
      params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 30;

    const thread = await this.threadsRepo.findOne({
      where: { id: threadId } as any,
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (String(thread.user_id) !== String(userId))
      throw new ForbiddenException('Thread belongs to another user');

    const qb = this.threadMessagesRepo
      .createQueryBuilder('m')
      .where('m.thread_id = :tid', { tid: threadId })
      .orderBy('m.created_at', 'DESC')
      .limit(limit);

    if (params.before) {
      qb.andWhere('m.created_at < :before', {
        before: new Date(params.before),
      });
    }

    const rowsDesc = await qb.getMany();
    const itemsAsc = rowsDesc.reverse();

    const nextCursor =
      itemsAsc.length === limit
        ? itemsAsc[0].created_at.toISOString()
        : undefined;

    return {
      threadId: String(thread.id),
      items: itemsAsc.map((m) => ({
        id: m.id,
        role: (m as any).role,
        content: m.content,
        created_at: m.created_at,
      })),
      nextCursor,
    };
  }

  async chatWithThread(params: {
    userId: string;
    prompt: string;
    threadId: string;
    systemPrompt: string;
  }): Promise<any> {
    let thread: Threads | null;
    if (params.threadId) {
      thread = await this.threadsRepo.findOne({
        where: { id: params.threadId },
      });
      if (!thread) {
        throw new NotFoundException('Thread not found');
      }
    } else {
      thread = this.threadsRepo.create({
        user_id: params.userId,
        title: null,
        system_prompt: params.systemPrompt,
        summary: null,
      });
      thread = await this.threadsRepo.save(thread);
    }

    const lastMessages = await this.threadMessagesRepo.find({
      where: { thread_id: thread.id },
      order: { created_at: 'ASC' },
      take: 40,
    });

    const history: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }> = [];

    if (thread.summary) {
      history.push({
        role: 'model',
        parts: [{ text: `Conversation summary:\n${thread.summary}` }],
      });
    }

    for (const m of lastMessages) {
      const r = (m as any).role as 'user' | 'model' | 'system' | undefined;
      if (r === 'system') continue;
      const role = r === 'user' ? 'user' : 'model';
      history.push({ role, parts: [{ text: m.content }] });
    }

    const model = this.gemini.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: thread.system_prompt ?? undefined,
    });

    const chat = model.startChat({ history });

    await this.threadMessagesRepo.save(
      this.threadMessagesRepo.create({
        thread_id: thread.id as any,
        content: params.prompt,
        parts: null,
        token_count: null,
        role: MessageRole.user,
      }) as any,
    );

    const result = await chat.sendMessage(params.prompt);
    const reply = result.response.text();

    await this.threadMessagesRepo.save(
      this.threadMessagesRepo.create({
        thread_id: thread.id as any,
        content: reply,
        parts: null,
        token_count: null,
        role: MessageRole.model,
      }) as any,
    );
    await this.threadsRepo.update(thread.id as any, { updated_at: new Date() });

    return { reply, threadId: String(thread.id) };
  }

  async findAllThreads(params: {
    userId: string;
    offset?: number;
    limit?: number;
    q?: string;
  }): Promise<{
    total: number;
    items: Array<{
      id: string;
      title: string | null;
      system_prompt: string | null;
      summary: string | null;
      created_at: Date;
      updated_at: Date;
    }>;
    nextOffset?: number;
    hasMore: boolean;
  }> {
    const { userId } = params;
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 20;

    const qb = this.threadsRepo
      .createQueryBuilder('t')
      .where('t.user_id = :uid', { uid: userId })
      .orderBy('t.updated_at', 'DESC')
      .offset(offset)
      .limit(limit);

    if (params.q) {
      qb.andWhere('(t.title ILIKE :q OR t.summary ILIKE :q)', {
        q: `%${params.q}%`,
      });
    }

    const [rows, total] = await qb.getManyAndCount();

    const items = rows.map((t) => ({
      id: String(t.id),
      title: t.title ?? null,
      system_prompt: t.system_prompt ?? null,
      summary: t.summary ?? null,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    const nextOffset = offset + items.length;
    const hasMore = nextOffset < total;

    return {
      total,
      items,
      nextOffset: hasMore ? nextOffset : undefined,
      hasMore,
    };
  }

  async deleteThread(params: {
    userId: string;
    threadId: string;
  }): Promise<void> {
    const { userId, threadId } = params;

    const thread = await this.threadsRepo.findOne({
      where: { id: threadId } as any,
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (String(thread.user_id) !== String(userId)) {
      throw new ForbiddenException('Thread belongs to another user');
    }

    await this.threadsRepo.delete(threadId as any);
  }
}
