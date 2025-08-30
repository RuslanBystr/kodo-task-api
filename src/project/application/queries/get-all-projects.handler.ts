import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { SortOrderEnum } from '../../../common/enums';
import { generateSearchConditions } from '../../../common/utils';
import { UserSortByEnum } from '../../../user/enums';
import { Project } from '../../infrastructure/entities/project.entity';
import { GetAllProjectsQuery } from './get-all-projects.query';

@QueryHandler(GetAllProjectsQuery)
export class GetAllProjectsHandler
  implements IQueryHandler<GetAllProjectsQuery>
{
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
  ) {}

  async execute({ filters, userId }: GetAllProjectsQuery) {
    const {
      page = 1,
      limit = 10,
      sortBy = UserSortByEnum.CREATED_AT,
      order = SortOrderEnum.ASC,
      ...searchFilterFields
    } = filters;

    const skip = (page - 1) * limit;

    const conditions: FindOptionsWhere<Project> =
      generateSearchConditions<Project>(searchFilterFields);

    const [projectItems] = await this.projectRepo.findAndCount({
      select: ['id', 'name', 'description', 'image', 'createdAt'],
      where: conditions,
      relations: ['tasks', 'members'],
      skip,
      take: limit,
      order: { [sortBy]: order },
    });

    const filteredProjects = projectItems.filter((project) =>
      project.members.some((member) => member.id === userId),
    );

    const filteredTotal = filteredProjects.length;
    const totalPages = Math.ceil(filteredTotal / limit);

    return {
      items: filteredProjects,
      meta: {
        totalItems: filteredTotal,
        itemCount: filteredProjects.length,
        itemsPerPage: Number(limit),
        totalPages,
        currentPage: Number(page),
      },
    };
  }
}
