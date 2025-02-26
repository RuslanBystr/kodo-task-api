import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat, ChatType } from '../entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createPrivateChat(user1Id: number, user2Id: number): Promise<Chat> {
    const users = await this.userRepo.findByIds([user1Id, user2Id]);
    const chat = this.chatRepo.create({ type: ChatType.PRIVATE, users });
    return this.chatRepo.save(chat);
  }

  async createGroupChat(userIds: number[], name: string): Promise<Chat> {
    const users = await this.userRepo.findByIds(userIds);
    const chat = this.chatRepo.create({ type: ChatType.GROUP, name, users });
    return this.chatRepo.save(chat);
  }

  async getUserChats(userId: number): Promise<Chat[]> {
    return this.chatRepo.find({
      where: { users: { id: userId } },
      relations: ['users', 'messages'],
    });
  }
}
