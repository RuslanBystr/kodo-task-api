import { InternalServerErrorException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';

import { SortOrderEnum } from '../../../../common/enums';
import { generateSearchConditions } from '../../../../common/utils';
import { TaskSortByEnum } from '../../domain';
import { Task } from '../../infrastructure/entities/task.entity';
import { GetAssignedTasksQuery } from './get-assigned-tasks.query';

@QueryHandler(GetAssignedTasksQuery)
export class GetAssignedTasksHandler
  implements IQueryHandler<GetAssignedTasksQuery>
{
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async execute(q: GetAssignedTasksQuery): Promise<{
    items: Task[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    const {
      page = 1,
      limit = 20,
      sortBy = TaskSortByEnum.CREATED_AT,
      order = SortOrderEnum.DESC,
      projectId,
      ...searchFilterFields
    } = q.filters || {};

    const pageNum = Number(page) || 1;
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const sortKey = (Object.values(TaskSortByEnum) as string[]).includes(
      String(sortBy),
    )
      ? (sortBy as keyof Task)
      : (TaskSortByEnum.CREATED_AT as keyof Task);

    const sortDirection = (Object.values(SortOrderEnum) as string[]).includes(
      String(order),
    )
      ? (order as 'ASC' | 'DESC')
      : 'DESC';

    const baseConditions: FindOptionsWhere<Task> =
      generateSearchConditions<Task>(searchFilterFields);

    const where: FindOptionsWhere<Task> = {
      ...baseConditions,
      ...(projectId ? { project: { id: projectId } } : {}),
      assignedUser: { id: Number(q.userId) },
    };

    const orderBy: FindOptionsOrder<Task> = {
      status: 'ASC',
      [sortKey]: sortDirection,
    } as FindOptionsOrder<Task>;

    try {
      const [taskItems, total] = await this.taskRepo.findAndCount({
        where,
        relations: ['assignedUser', 'project'],
        skip,
        take: limitNum,
        order: orderBy,
      });

      const totalPages = Math.max(1, Math.ceil(total / limitNum));

      return {
        items: taskItems,
        meta: {
          totalItems: total,
          itemCount: taskItems.length,
          itemsPerPage: limitNum,
          totalPages,
          currentPage: pageNum,
        },
      };
    } catch (e) {
      throw new InternalServerErrorException(
        'Something went wrong while fetching tasks',
      );
    }
  }
}
