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
  ) {}

  async sendMessage(messageDto: CreateMessageDto): Promise<any> {
    const { chatId, senderId, content } = messageDto;
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    const message = this.messageRepo.create({
      content,
      sender: { id: senderId },
      chat,
    });
    return this.messageRepo.save(message);
  }

  public async getMessages({
    page = 1,
    limit = 100,
    chatId,
  }: GetAllMessageFilterDto): Promise<any> {
    const [messageItems, total] = await this.messageRepo
        .createQueryBuilder('message')
        .select([
          'message.id',
          'message.content',
          'message.createdAt',
          'sender.id'
        ])
        .leftJoin('message.sender', 'sender')
        .where('message.chatId = :chatId', { chatId })
        .orderBy('message.createdAt', 'ASC')
        .take(limit)
        .skip((page - 1) * limit)
        .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      items: messageItems,
      meta: {
        totalItems: total,
        itemCount: messageItems.length,
        itemsPerPage: Number(limit),
        totalPages,
        currentPage: Number(page),
      },
    };
  }
}
