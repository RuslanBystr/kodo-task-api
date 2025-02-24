import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LogType } from '../enums/type.enum';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public message: string;

  @Column({
    name: 'stack_trace',
  })
  public stackTrace: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;

  @Column({
    type: 'enum',
    enum: LogType,
    nullable: true,
  })
  public type: LogType;
}
