import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../../chat/entities/chat.entity';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetAllMessageFilterDto } from '../dto/get-all-message-filters.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    // private readonly redisService: RedisService
  ) {}

  async sendMessage(messageDto: CreateMessageDto): Promise<any> {
    const { chatId, senderId, content } = messageDto;
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    const message = this.messageRepo.create({
      content,
      sender: { id: senderId },
      chat,
    });
    const savedMessage = await this.messageRepo.save(message);
    // const cacheKey = `chat:${chatId}:messages`;
    // await this.redisService.deleteCache(cacheKey);
    return savedMessage;
  }

  public async getMessages({
    page = 1,
    limit = 20,
    chatId,
  }: GetAllMessageFilterDto): Promise<any> {
    // const cacheKey = `chat:${chatId}:messages`;
    //
    // const cachedMessages = await this.redisService.getCache(cacheKey);
    // if (cachedMessages) {
    //   return cachedMessages;
    // }

    const [messageItems, total] = await this.messageRepo
      .createQueryBuilder('message')
      .select([
        'message.id',
        'message.content',
        'message.createdAt',
        'sender.id',
      ])
      .leftJoin('message.sender', 'sender')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const response = {
      items: messageItems
        ?.map((msg) => ({
          ...msg,
          sender: msg.sender.id,
        }))
        .reverse(),
      meta: {
        totalItems: total,
        itemCount: messageItems.length,
        itemsPerPage: Number(limit),
        totalPages,
        currentPage: Number(page),
      },
    };

    // await this.redisService.setCache(cacheKey, response, 60);
    return response;
  }
}
