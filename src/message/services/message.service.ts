import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {}

  async sendMessage(
    content: string,
    sender: User,
    receiver: User,
  ): Promise<Message> {
    const message = this.messageRepo.create({ content, sender, receiver });
    return await this.messageRepo.save(message);
  }

  async getMessages(senderId: number, receiverId: number): Promise<Message[]> {
    return await this.messageRepo.find({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(messageId: number): Promise<void> {
    await this.messageRepo.update(messageId, { isRead: true });
  }
}
