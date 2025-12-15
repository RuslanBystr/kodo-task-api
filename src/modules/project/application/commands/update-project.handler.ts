import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from '../../../user/entities/user.entity';
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
    const { id, dto } = c;

    return this.projectRepo.manager.transaction(async (trx) => {
      const current = await trx.findOne(Project, {
        where: { id },
        relations: ['owner', 'members'],
      });
      if (!current) throw new NotFoundException(`Project ${id} not found`);

      const { members: memberIds, ...scalars } = dto;

      const hasScalars = Object.keys(scalars).length > 0;
      if (hasScalars) {
        await trx.update(Project, id, scalars);
      }

      if (Array.isArray(memberIds)) {
        const uniqueIds = Array.from(new Set(memberIds));
        const users = uniqueIds.length
          ? await trx.getRepository(User).findBy({ id: In(uniqueIds) })
          : [];

        if (!users.some((u) => u.id === current.owner.id)) {
          users.push(current.owner);
        }

        current.members = users;
        await trx.save(Project, current);
      }

      return trx.findOne(Project, {
        where: { id },
        relations: ['tasks', 'members'],
      });
    });
  }
}
