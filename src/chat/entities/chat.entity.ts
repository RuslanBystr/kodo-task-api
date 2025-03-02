import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { Message } from '../../message/entities/message.entity';
import { UserChat } from './user.chat.entity';

export enum ChatType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ChatType })
  type: ChatType;

  @OneToMany(() => UserChat, (userChat) => userChat.chat)
  userChats: UserChat[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @Column({ nullable: true })
  groupName?: string;
}
