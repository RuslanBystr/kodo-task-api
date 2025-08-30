import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { UserChat } from '../entities/user.chat.entity';
import { DataSource, In, Repository } from 'typeorm';
import { GetAllChatsFilterDto } from '../dto';
import { Message } from '../entities/message.entity';
import { CryptoService } from '../../crypto/crypto.service';
import { FileEntity } from '../../file/entities/file.entity';
import { ChatType } from '../enums/chat-type.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserChat) private userChatRepo: Repository<UserChat>,
    private readonly dataSource: DataSource,
    private readonly cryptoService: CryptoService,
  ) {}

  async getChatData(chatId: number): Promise<Chat> {
    try {
      const chat = await this.chatRepo.findOne({
        where: { id: chatId },
        relations: ['userChats'],
      });
      return chat;
    } catch (error) {
      console.error(error);
    }
  }

  async lastMessageDescription(chatItems: Chat[]): Promise<
    {
      id: number;
      type: ChatType;
      userChats: UserChat[];
      lastMessage: {
        id: number;
        content: string;
        voiceMessage: FileEntity | null;
        file: FileEntity | null;
        sender: User;
        chat: Chat;
        createdAt: Date;
        isRead: boolean;
        readByUsers: User[];
        reaction: string | null;
        linkToMessage: Message | null;
      } | null;
      messages: Message[];
      groupName?: string;
    }[]
  > {
    return Promise.all(
      chatItems.map(async (chatItem: Chat) => ({
        ...chatItem,
        lastMessage: chatItem.lastMessage
          ? {
              ...chatItem.lastMessage,
              content: chatItem.lastMessage.content
                ? await this.cryptoService.decryptMessage(
                    chatItem.lastMessage.content,
                  )
                : chatItem.lastMessage.content,
            }
          : null,
      })),
    );
  }

  async getUserChats({
    page = 1,
    limit = 100,
    userId,
  }: GetAllChatsFilterDto): Promise<any> {
    const [chatItems, total] = await this.chatRepo
      .createQueryBuilder('chat')
      .where('chat.type = :type', { type: ChatType.PRIVATE })
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
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    const filteredChatItems = chatItems.filter((chatItem: Chat) =>
      chatItem.userChats.some((userChat) => userChat.user.id === userId),
    );

    const chats = await this.lastMessageDescription(filteredChatItems);
    return {
      items: chats,
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
    try {
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

      const chats = await this.lastMessageDescription(chatItems);

      return {
        items: chats,
        meta: {
          totalItems: total,
          itemCount: chatItems.length,
          itemsPerPage: Number(limit),
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
        },
      };
    } catch (err) {
      throw err;
    }
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
    try {
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
    } catch (err) {
      throw err;
    }
  }
  async addChatMembers(
    chatId: number,
    userIds: number[],
  ): Promise<{ added: number[]; skipped: number[] }> {
    return this.dataSource.transaction(async (manager) => {
      const chat = await manager.getRepository(Chat).findOne({
        where: { id: chatId },
        relations: { userChats: { user: true } },
      });
      if (!chat) throw new NotFoundException('Chat not found');
      if (chat.type !== ChatType.GROUP) {
        throw new BadRequestException(
          'Members can be added only to group chats',
        );
      }

      const users = await manager
        .getRepository(User)
        .findBy({ id: In(userIds) });
      const foundIds = new Set(users.map((u) => u.id));

      const existingIds = new Set(chat.userChats.map((uc) => uc.user.id));

      const toAddIds = [...foundIds].filter((id) => !existingIds.has(id));
      const skipped = userIds.filter((id) => !toAddIds.includes(id));

      if (toAddIds.length === 0) {
        return { added: [], skipped };
      }

      const userChatRepo = manager.getRepository(UserChat);
      const toAddEntities = toAddIds.map((id) =>
        userChatRepo.create({
          chat: { id: chatId } as Chat,
          user: { id } as User,
          name: chat.groupName,
        }),
      );

      await userChatRepo.save(toAddEntities);

      return { added: toAddIds, skipped };
    });
  }

  async removeChatMember(chatId: number, userId: number): Promise<void> {
    const res = await this.userChatRepo.delete({
      chat: { id: chatId },
      user: { id: userId },
    });
    if (!res.affected) {
      throw new NotFoundException('Member not found in chat');
    }
  }

  async deletePrivateChat(chatId: number): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['messages'],
    });
    if (!chat) throw new NotFoundException(`Chat with id ${chatId} not found`);
    await this.chatRepo
      .createQueryBuilder()
      .delete()
      .from(Message)
      .where('chatId = :chatId', { chatId })
      .execute();

    return await this.chatRepo.remove(chat);
  }

  async getChatMembers(chatId: number): Promise<User[]> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['userChats', 'userChats.user'],
    });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    return chat.userChats.map((userChat) => userChat.user);
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
