import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from '../../infrastructure/entities/project.entity';
import { GetProjectByIdQuery } from './get-project-by-id.query';

@QueryHandler(GetProjectByIdQuery)
export class GetProjectByIdHandler
  implements IQueryHandler<GetProjectByIdQuery>
{
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  execute(q: GetProjectByIdQuery) {
    return this.projectRepo.findOne({
      where: { id: q.id },
      relations: ['tasks', 'members'],
    });
  }
}
