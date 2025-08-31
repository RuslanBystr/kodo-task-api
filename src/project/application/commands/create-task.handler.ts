import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../user/entities/user.entity';
import { Project } from '../../infrastructure/entities/project.entity';
import { Task } from '../../infrastructure/entities/task.entity';
import { CreateTaskCommand } from './create-task.command';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async execute(cmd: CreateTaskCommand): Promise<{ id: string | number }> {
    const [user, project] = await Promise.all([
      cmd.assignedUserId
        ? this.userRepo.findOne({
            where: { id: cmd.assignedUserId },
          })
        : Promise.resolve(null),
      this.projectRepo.findOne({ where: { id: cmd.projectId } }),
    ]);

    if (!project) throw new Error('Project not found');
    if (cmd.assignedUserId && !user) throw new Error('Assigned user not found');

    const task = this.taskRepo.create({
      title: cmd.title,
      description: cmd.description,
      project,
      estimate: cmd.estimate,
      priority: cmd.priority,
      assignedUser: user ?? null,
    });

    const saved = await this.taskRepo.save(task);

    return { id: saved.id };
  }
}
