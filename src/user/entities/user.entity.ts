import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UsersRoleEnum } from '../enums';
import { Task } from '../../project/entities/task.entity';
import { Message } from '../../message/entities/message.entity';
import { UserChat } from '../../chat/entities/user.chat.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true, name: 'first_name' })
  public firstName: string;

  @Column({ nullable: true, name: 'last_name' })
  public lastName: string;

  @Column({ nullable: true })
  public phone: string;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  public password: string;

  @Column({ default: true })
  public status: boolean;

  @Column({ default: UsersRoleEnum.USER })
  public role: UsersRoleEnum;

  @Column({ default: false, name: 'is_blocked' })
  public isBlocked: boolean;

  @Column({ type: 'uuid', nullable: true })
  public avatar: string;

  @OneToMany(() => Task, (task) => task.assignedUser)
  tasks: Task[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => UserChat, (userChat) => userChat.user)
  userChats: UserChat[];

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  public deletedAt: Date;
}
