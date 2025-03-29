import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../../chat/entities/chat.entity';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetAllMessageFilterDto } from '../dto/get-all-message-filters.dto';
import { FileEntity } from '../../file/entities/file.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(FileEntity) private fileRepo: Repository<FileEntity>,
    @InjectRepository(User) private userRepo: Repository<User>,
    // private readonly redisService: RedisService
  ) {}

  async sendMessage(messageDto: CreateMessageDto): Promise<Message> {
    const {
      chatId,
      senderId,
      content = null,
      voiceMessage,
      file,
      linkToMessage,
    } = messageDto;
    console.log('UUID: ', file);
    let voiceFile: FileEntity | null = null;
    let fileImage: FileEntity | null = null;

    if (voiceMessage) {
      voiceFile = await this.fileRepo.findOne({
        where: { uuid: voiceMessage },
      });
    }

    if (file) {
      fileImage = await this.fileRepo.findOne({ where: { uuid: file } });
      console.log('file: ', fileImage);
    }

    let replyMessage: Message | null = null;
    if (linkToMessage) {
      replyMessage = await this.messageRepo.findOne({
        where: { id: Number(linkToMessage) },
        relations: ['sender'],
      });
    }

    console.log('Reply Message:', replyMessage);
    console.log('Voice File:', voiceFile);
    console.log('File:', fileImage);

    const chat = await this.chatRepo.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    const message = this.messageRepo.create({
      content,
      voiceMessage: voiceFile,
      sender: { id: senderId },
      chat,
      linkToMessage: replyMessage,
      file: fileImage,
    });

    const savedMessage = await this.messageRepo.save(message);

    chat.lastMessage = savedMessage;
    await this.chatRepo.save(chat);

    return savedMessage;
  }

  async addReactionOnMessage(id: number, reaction: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id } });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    message.reaction = reaction;
    return this.messageRepo.save(message);
  }

  async markAsRead(userId: number, readByUserId: number): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id: userId },
      relations: ['readByUsers'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${userId} not found`);
    }

    const user = await this.userRepo.findOne({ where: { id: readByUserId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${readByUserId} not found`);
    }

    if (!message.readByUsers.some((u) => u.id === readByUserId)) {
      message.readByUsers.push(user);
    }

    message.isRead = true;
    return this.messageRepo.save(message);
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
        'message.reaction',
        'message.isRead',
        'message.createdAt',
        'voiceMessage.uuid',
      ])
      .leftJoinAndSelect('message.voiceMessage', 'voiceMessage')
      .leftJoinAndSelect('message.file', 'file')
      .leftJoinAndSelect('message.linkToMessage', 'linkToMessage')
      .leftJoin('message.readByUsers', 'readByUsers')
      .addSelect([
        'readByUsers.id',
        'readByUsers.avatar',
        'readByUsers.firstName',
        'readByUsers.lastName',
      ])
      .leftJoinAndSelect('linkToMessage.sender', 'linkedSender')
      .addSelect(['linkedSender.id', 'linkedSender.firstName'])
      .leftJoin('message.sender', 'sender')
      .addSelect([
        'sender.id',
        'sender.avatar',
        'sender.firstName',
        'sender.lastName',
      ])
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    // await this.redisService.setCache(cacheKey, response, 60);
    return {
      items: messageItems
        ?.map((msg) => ({
          ...msg,
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
  }

  async removeMessage(id: number): Promise<any> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['chat'],
    });

    if (!message) {
      throw new Error(`Message with ID ${id} not found`);
    }

    const chat = message.chat;
    await this.messageRepo.remove(message);
    console.log(message.chat);
    if (chat) {
      const latestMessage = await this.messageRepo.findOne({
        where: { chat: { id: chat.id } },
        order: { createdAt: 'DESC' },
      });
      console.log(latestMessage);
      chat.lastMessage = latestMessage || null;
      await this.chatRepo.save(chat);
    }
    return message;
  }
}
