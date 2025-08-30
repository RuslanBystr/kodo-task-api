import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from '../../infrastructure/entities/project.entity';
import { UpdateProjectCommand } from './update-project.command';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler
  implements ICommandHandler<UpdateProjectCommand>
{
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}
  async execute(c: UpdateProjectCommand) {
    await this.projectRepo.update(c.id, c.dto);
    return this.projectRepo.findOne({
      where: { id: c.id },
      relations: ['tasks', 'members'],
    });
  }
}
