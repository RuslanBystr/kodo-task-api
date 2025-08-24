import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateProjectCommand } from './create-project.command';
import { Project } from '../../infrastructure/entities/project.entity';
import { User } from '../../../user/entities/user.entity';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler
  implements ICommandHandler<CreateProjectCommand>
{
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async execute(c: CreateProjectCommand) {
    const user = await this.userRepo.findOne({ where: { id: c.userId } });
    if (!user)
      throw new NotFoundException(`User with ID ${c.userId} not found`);

    const project = this.projectRepo.create({ ...c.dto, members: [user] });
    await this.projectRepo.save(project);
    return project;
  }
}
