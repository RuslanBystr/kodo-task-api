import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Chat } from './chat.entity';

@Entity()
export class UserChat {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.userChats, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Chat, (chat) => chat.userChats, { onDelete: 'CASCADE' })
    chat: Chat;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    avatar?: string;
}
