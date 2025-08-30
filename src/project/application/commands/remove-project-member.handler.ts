import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from '../../infrastructure/entities/project.entity';
import { RemoveProjectMemberCommand } from './remove-project-member.command';

@CommandHandler(RemoveProjectMemberCommand)
export class RemoveProjectMemberHandler
  implements ICommandHandler<RemoveProjectMemberCommand>
{
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  private async isUserMember(projectId: string, userId: number) {
    const count = await this.projectRepo
      .createQueryBuilder('p')
      .innerJoin('p.members', 'm', 'm.id = :userId', { userId })
      .where('p.id = :projectId', { projectId })
      .getCount();
    return count > 0;
  }

  async execute(c: RemoveProjectMemberCommand) {
    const project = await this.projectRepo.findOne({
      where: { id: c.projectId },
      relations: ['members'],
    });
    if (!project)
      throw new NotFoundException(`Project with ID ${c.projectId} not found`);

    if (!(await this.isUserMember(c.projectId, c.currentUserId))) {
      throw new ForbiddenException(
        'You do not have permission to remove members from this project',
      );
    }

    const idx = project.members.findIndex((m) => m.id === c.dto.userId);
    if (idx === -1) return { message: 'User is not a member of this project' };

    project.members.splice(idx, 1);
    await this.projectRepo.save(project);

    return { message: 'User removed from project successfully' };
  }
}
