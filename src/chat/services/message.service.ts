import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../entities/chat.entity';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FileEntity } from '../../file/entities/file.entity';
import { User } from '../../user/entities/user.entity';
import { CryptoService } from '../../crypto/crypto.service';
import { CreateMessageDto, GetAllMessageFilterDto } from '../dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(FileEntity) private fileRepo: Repository<FileEntity>,
    @InjectRepository(User) private userRepo: Repository<User>,

    private readonly cryptoService: CryptoService,
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

    const chat = await this.chatRepo.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    const encryptTextMessage = content
      ? await this.cryptoService.encryptMessage(content)
      : null;

    const message = this.messageRepo.create({
      content: encryptTextMessage,
      voiceMessage: voiceFile,
      sender: { id: senderId },
      chat,
      linkToMessage: replyMessage,
      file: fileImage,
    });

    const savedMessage = await this.messageRepo.save(message);

    const fullMessage = await this.messageRepo.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    chat.lastMessage = savedMessage;
    await this.chatRepo.save(chat);

    if (!fullMessage) {
      throw new Error('Failed to load saved message');
    }

    return await this.getMessageById(savedMessage.id);
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

  async getMessageById(id: number): Promise<Message> {
    const message = await this.messageRepo
      .createQueryBuilder('message')
      .select([
        'message.id',
        'message.content',
        'message.reaction',
        'message.isRead',
        'message.createdAt',
        'voiceMessage.uuid',
        'file.uuid',
      ])
      .leftJoinAndSelect('message.voiceMessage', 'voiceMessage')
      .leftJoinAndSelect('message.file', 'file')
      .leftJoin('message.linkToMessage', 'linkToMessage')
      .addSelect(['linkToMessage.id', 'linkToMessage.content'])
      .leftJoin('linkToMessage.file', 'replyMessageFile')
      .addSelect(['replyMessageFile.uuid'])
      .leftJoin('linkToMessage.voiceMessage', 'replyVoiceMessage')
      .addSelect(['replyVoiceMessage.uuid'])
      .leftJoin('linkToMessage.sender', 'replyToSender')
      .addSelect(['replyToSender.id', 'replyToSender.firstName'])
      .leftJoin('message.sender', 'sender')
      .addSelect([
        'sender.id',
        'sender.avatar',
        'sender.firstName',
        'sender.lastName',
      ])
      .where('message.id = :id', { id })
      .getOne();

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    const decryptedMessage = {
      ...message,
      content: message.content
        ? await this.cryptoService.decryptMessage(message.content)
        : null,
      linkToMessage: message.linkToMessage
        ? {
            ...message.linkToMessage,
            content: message.linkToMessage.content
              ? await this.cryptoService.decryptMessage(
                  message.linkToMessage.content,
                )
              : null,
          }
        : null,
    };

    return decryptedMessage;
  }

  public async getMessages({
    page = 1,
    limit = 20,
    chatId,
  }: GetAllMessageFilterDto): Promise<any> {
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

      .leftJoin('message.linkToMessage', 'linkToMessage')
      .addSelect(['linkToMessage.id', 'linkToMessage.content'])

      .leftJoin('message.readByUsers', 'readByUsers')
      .addSelect([
        'readByUsers.id',
        'readByUsers.avatar',
        'readByUsers.firstName',
        'readByUsers.lastName',
      ])

      .leftJoin('linkToMessage.file', 'replyMessageFile')
      .addSelect(['replyMessageFile.uuid'])

      .leftJoin('linkToMessage.voiceMessage', 'replyVoiceMessage')
      .addSelect(['replyVoiceMessage.uuid'])

      .leftJoin('linkToMessage.sender', 'replyToSender')
      .addSelect(['replyToSender.id', 'replyToSender.firstName'])

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

    const decryptedMessages = await Promise.all(
      messageItems.map(async (item) => ({
        ...item,
        linkToMessage: item.linkToMessage
          ? {
              ...item.linkToMessage,
              content: item.linkToMessage.content
                ? await this.cryptoService.decryptMessage(
                    item.linkToMessage.content,
                  )
                : item.linkToMessage.content,
            }
          : null,
        content: item.content
          ? await this.cryptoService.decryptMessage(item.content)
          : item.content,
      })),
    );

    return {
      items: decryptedMessages.reverse(),
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
    if (chat) {
      const latestMessage = await this.messageRepo.findOne({
        where: { chat: { id: chat.id } },
        order: { createdAt: 'DESC' },
      });
      chat.lastMessage = latestMessage || null;
      await this.chatRepo.save(chat);
    }
    return message;
  }
}
