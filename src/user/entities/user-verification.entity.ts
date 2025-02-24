import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_verification' })
export class UserVerification {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public code: string;

  @Column({
    name: 'expired_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public expiredAt: Date;

  @Column({ nullable: true })
  email: string;

  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @ManyToOne(() => User, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
    cascade: true,
  })
  public user: User;
}
