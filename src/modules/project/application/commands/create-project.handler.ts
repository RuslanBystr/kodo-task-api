import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../user/entities/user.entity';
import { Project } from '../../infrastructure/entities/project.entity';
import { CreateProjectCommand } from './create-project.command';

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
    if (!user) {
      throw new NotFoundException(`User with ID ${c.userId} not found`);
    }

    const members: User[] = [];
    if (c.dto.members?.length) {
      const foundMembers = await this.userRepo.findByIds(c.dto.members);
      members.push(...foundMembers);
    }

    if (!members.find((m) => m.id === user.id)) {
      members.push(user);
    }

    const project = this.projectRepo.create({
      name: c.dto.name,
      description: c.dto.description,
      image: c.dto.image,
      owner: user,
      members,
    });

    return this.projectRepo.save(project);
  }
}
