import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat, ChatType } from '../entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { UserChat } from '../entities/user.chat.entity';
import { In, Repository } from 'typeorm';
import {GetAllChatsFilterDto} from "../dto/get-all-chats-user.dto";

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
      .innerJoinAndSelect('userChats.user', 'users')
      .addSelect(['users.id', 'users.firstName', 'users.lastName'])
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    const filteredChatItems = chatItems.filter((chatItem: Chat) =>
      chatItem.userChats.some(userChat => userChat.user.id === userId)
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
      .andWhere('userChat.userId IN (:...userIds)', { userIds: [user1Id, user2Id] })
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
      const userChat = this.userChatRepo.create({ chat, user, name: groupName });
      await this.userChatRepo.save(userChat);
    }

    return chat;
  }
  async chatMember(userId: string, chatId: string): Promise<boolean> {
    const chat = await this.userChatRepo.findOne({
      where: {
        user: { id: Number(userId) },
        chat: { id: Number(chatId) },
      },
      relations: ['user', 'chat'],
    });

    return !!chat;
  }

}
