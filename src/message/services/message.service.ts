import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../../chat/entities/chat.entity';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetAllMessageFilterDto } from '../dto/get-all-message-filters.dto';
import { FileEntity } from '../../file/entities/file.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(FileEntity) private fileRepo: Repository<FileEntity>,
    // private readonly redisService: RedisService
  ) {}

  async sendMessage(messageDto: CreateMessageDto): Promise<Message> {
    console.log(messageDto);
    const { chatId, senderId, content = null, voiceMessage } = messageDto;
    let file = null;
    if (voiceMessage) {
      file = await this.fileRepo.findOne({ where: { uuid: voiceMessage } });
    }
    console.log(file);
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    const message = this.messageRepo.create({
      content,
      voiceMessage: file,
      sender: { id: senderId },
      chat,
    });

    const savedMessage = await this.messageRepo.save(message);

    chat.lastMessage = savedMessage;
    await this.chatRepo.save(chat);

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
        'voiceMessage.uuid',
        'sender.id',
      ])
      .leftJoinAndSelect('message.voiceMessage', 'voiceMessage')
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

  async removeMessage(id: number): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) {
      throw new Error(`Message with ID ${id} not found`);
    }
    return await this.messageRepo.remove(message);  }
}
