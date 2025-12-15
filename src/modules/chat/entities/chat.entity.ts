import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ChatType } from '../enums/chat-type.enum';
import { Message } from './message.entity';
import { UserChat } from './user.chat.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ChatType })
  type: ChatType;

  @OneToMany(() => UserChat, (userChat) => userChat.chat)
  userChats: UserChat[];

  @OneToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  lastMessage?: Message;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @Column({ nullable: true })
  groupName?: string;
}
