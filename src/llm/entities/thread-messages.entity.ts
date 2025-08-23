import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Threads } from './threads.entity';

export enum MessageRole {
  user = 'user',
  model = 'model',
  system = 'system',
}

@Entity({ name: 'thread_messages' })
@Index(['thread_id', 'created_at'])
export class ThreadMessages {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'bigint' })
  thread_id!: string;

  @ManyToOne(() => Threads, (t) => t.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id', referencedColumnName: 'id' })
  thread!: Threads;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: MessageRole,
    default: MessageRole.user,
  })
  role!: MessageRole;

  @Column({ type: 'jsonb', nullable: true })
  parts!: unknown | null;

  @Column({ type: 'integer', nullable: true })
  token_count!: number | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;
}
