import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetProjectMembersQuery } from './get-project-members.query';
import { Project } from '../../infrastructure/entities/project.entity';

@QueryHandler(GetProjectMembersQuery)
export class GetProjectMembersHandler
  implements IQueryHandler<GetProjectMembersQuery>
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

  async execute(q: GetProjectMembersQuery) {
    const project = await this.projectRepo.findOne({
      where: { id: q.projectId },
      relations: ['members'],
    });
    if (!project)
      throw new NotFoundException(`Project with ID ${q.projectId} not found`);

    if (!(await this.isUserMember(q.projectId, q.currentUserId))) {
      throw new ForbiddenException(
        'You do not have permission to view members of this project',
      );
    }

    return { items: project.members };
  }
}
