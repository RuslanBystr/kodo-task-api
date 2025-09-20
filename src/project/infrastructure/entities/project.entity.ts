import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../../user/entities/user.entity';
import { Task } from './task.entity';

export enum ProjectStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  COMPLETED = 'Completed',
}

export enum ProjectVisibilityEnum {
  PRIVATE = 'Private',
  INTERNAL = 'Internal',
  PUBLIC = 'Public',
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  public image: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'project_members',
    joinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  members: User[];

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: User | null;

  @Column({ type: 'uuid', name: 'owner_id', nullable: true })
  ownerId?: string | null;

  @Column({
    type: 'enum',
    enum: ProjectStatusEnum,
    default: ProjectStatusEnum.ACTIVE,
  })
  status: ProjectStatusEnum;

  @Column({
    type: 'enum',
    enum: ProjectVisibilityEnum,
    default: ProjectVisibilityEnum.PRIVATE,
  })
  visibility: ProjectVisibilityEnum;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;
}
