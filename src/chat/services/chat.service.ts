import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat, ChatType } from '../entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { UserChat } from '../entities/user.chat.entity';
import { In, Repository } from 'typeorm';
import { GetAllChatsFilterDto } from '../dto/get-all-chats-user.dto';
import { Message } from '../../message/entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserChat) private userChatRepo: Repository<UserChat>,
  ) {}

  async getUserChats({
    page = 1,
    limit = 100,
    userId,
  }: GetAllChatsFilterDto): Promise<any> {
    const [chatItems, total] = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.userChats', 'userChats')
      .innerJoin('userChats.user', 'users')
      .addSelect([
        'users.id',
        'users.firstName',
        'users.lastName',
        'users.avatar',
      ])
      .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.file', 'file')
      .leftJoinAndSelect(
        'chat.messages',
        'message',
        'message.isRead = :isRead AND message.sender != :senderId',
        {
          isRead: false,
          senderId: userId,
        },
      )
      .orderBy('chat.lastMessage', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    const filteredChatItems = chatItems.filter((chatItem: Chat) =>
      chatItem.userChats.some((userChat) => userChat.user.id === userId),
    );

    return {
      items: filteredChatItems,
      meta: {
        totalItems: total,
        itemCount: chatItems.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    };
  }

  async getUserGroupChats({ page = 1, limit = 100, userId }): Promise<any> {
    const [chatItems, total] = await this.chatRepo
      .createQueryBuilder('chat')
      .where('chat.type = :type', { type: ChatType.GROUP })
      .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.file', 'file')
      .leftJoinAndSelect('chat.messages', 'messages')
      .leftJoinAndSelect(
        'chat.messages',
        'message',
        'message.isRead = :isRead AND message.sender != :senderId',
        {
          isRead: false,
          senderId: userId,
        },
      )
      .leftJoin('message.readByUsers', 'readUser', 'readUser.id = :userId', {
        userId,
      })
      .andWhere('readUser.id IS NULL')
      .orderBy('chat.lastMessage', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return {
      items: chatItems,
      meta: {
        totalItems: total,
        itemCount: chatItems.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    };
  }

  async createPrivateChat(user1Id: number, user2Id: number): Promise<Chat> {
    const users = await this.userRepo.findBy({
      id: In([user1Id, user2Id]),
    });

    if (users.length !== 2) {
      throw new Error('One or both users not found');
    }

    const existingChat = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat.userChats', 'userChat')
      .where('chat.type = :type', { type: ChatType.PRIVATE })
      .andWhere('userChat.userId IN (:...userIds)', {
        userIds: [user1Id, user2Id],
      })
      .groupBy('chat.id')
      .having('COUNT(userChat.userId) = 2')
      .getOne();

    if (existingChat) {
      return existingChat;
    }
    const chat = this.chatRepo.create({ type: ChatType.PRIVATE });
    await this.chatRepo.save(chat);

    for (const user of users) {
      const userChat = this.userChatRepo.create({
        chat,
        user,
        name: `${users.find((u) => u.id !== user.id).firstName}`,
        avatar: users.find((u) => u.id !== user.id).avatar,
      });
      await this.userChatRepo.save(userChat);
    }

    return chat;
  }
  async createGroupChat(userIds: number[], groupName: string): Promise<Chat> {
    const users = await this.userRepo.findBy({ id: In(userIds) });

    const chat = this.chatRepo.create({ type: ChatType.GROUP, groupName });
    await this.chatRepo.save(chat);

    for (const user of users) {
      const userChat = this.userChatRepo.create({
        chat,
        user,
        name: groupName,
      });
      await this.userChatRepo.save(userChat);
    }

    return chat;
  }

  async deletePrivateChat(chatId: number): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['messages'],
    });
    if (!chat) throw new NotFoundException('Chat with id {id} not found');
    await this.chatRepo
      .createQueryBuilder()
      .delete()
      .from(Message)
      .where('chatId = :chatId', { chatId })
      .execute();

    return await this.chatRepo.remove(chat);
  }

  async chatMember(userId: string, chatId: string): Promise<boolean> {
    const chat = await this.chatRepo.findOne({
      where: { id: Number(chatId) },
      select: ['type'],
    });

    if (!chat) return false;

    if (chat.type === 'GROUP') return true;

    const membership = await this.userChatRepo.findOne({
      where: {
        user: { id: Number(userId) },
        chat: { id: Number(chatId) },
      },
      relations: ['user', 'chat'],
    });

    return !!membership;
  }
}
