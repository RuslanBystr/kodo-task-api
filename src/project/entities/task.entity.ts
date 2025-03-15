import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../user/entities/user.entity';
import { TaskStatusEnum } from '../enums/task-status';
import { TaskLog } from './task-log.entity';

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  assignedUser: User;

  @Column({ type: 'enum', enum: TaskStatusEnum, default: TaskStatusEnum.TODO })
  status: TaskStatusEnum;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.LOW })
  priority: TaskPriority;

  @Column({ type: 'timestamp', nullable: true })
  started: Date;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ type: 'int', default: 0 })
  estimate: number;

  @Column({ type: 'int', default: 0 })
  spentTime: number;

  @OneToMany(() => TaskLog, (taskLog) => taskLog.task)
  timeLogger: TaskLog[];

  @Column({ type: 'int', default: 0 })
  remaining: number;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  project: Project;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;
}
