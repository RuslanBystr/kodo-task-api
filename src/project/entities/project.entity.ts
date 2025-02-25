import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Task } from './task.entity';
import { FileEntity } from '../../file/entities/file.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @JoinColumn({ name: 'image', referencedColumnName: 'id' })
  @OneToOne(() => FileEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
    cascade: true,
  })
  public image: FileEntity;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;
}
