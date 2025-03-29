import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { FileEntity } from '../../file/entities/file.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @OneToOne(() => FileEntity, { nullable: true, cascade: true })
  @JoinColumn({ name: 'voice_message_file_id' })
  voiceMessage: FileEntity | null;

  @OneToOne(() => FileEntity, { nullable: true, cascade: true })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity | null;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender: User;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @ManyToMany(() => User)
  @JoinTable()
  readByUsers: User[];

  @Column({ default: null, nullable: true })
  reaction: string | null;

  @ManyToOne(() => Message, { nullable: true })
  linkToMessage: Message | null;
}
