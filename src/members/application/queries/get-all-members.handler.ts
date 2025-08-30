import { InternalServerErrorException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { SortOrderEnum } from '../../../common/enums';
import { User } from '../../../user/entities/user.entity';
import { UserSortByEnum } from '../../../user/enums';
import { GetAllMembersQuery, UserSortColumnMap } from './get-all-members.query';

@QueryHandler(GetAllMembersQuery)
export class GetAllMembersHandler implements IQueryHandler<GetAllMembersQuery> {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async execute(query: GetAllMembersQuery) {
    const { filters, userId, projectId } = query;

    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit ?? 20)));
    const offset = (page - 1) * limit;

    try {
      const qb = this.users
        .createQueryBuilder('user')
        .leftJoin('project_members', 'pm', 'pm.user_id = user.id')
        .leftJoin('project_members', 'my', 'my.user_id = :userId', { userId });

      if (projectId) {
        qb.andWhere('pm.project_id = :projectId AND pm.status = :active', {
          projectId,
          active: 'active',
        });
      } else {
        qb.andWhere(
          new Brackets((w) => {
            w.where('pm.project_id IS NOT NULL').andWhere(
              'my.project_id = pm.project_id',
            );
          }),
        );
      }

      if (filters.id) qb.andWhere('user.id = :id', { id: filters.id });

      if (filters.firstName)
        qb.andWhere('user.firstName ILIKE :firstName', {
          firstName: `%${filters.firstName}%`,
        });

      if (filters.lastName)
        qb.andWhere('user.lastName ILIKE :lastName', {
          lastName: `%${filters.lastName}%`,
        });

      if (filters.email)
        qb.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });

      if (filters.phone)
        qb.andWhere('user.phone ILIKE :phone', { phone: `%${filters.phone}%` });

      if (typeof filters.status === 'boolean')
        qb.andWhere('user.status = :status', { status: filters.status });

      if (typeof filters.isBlocked === 'boolean')
        qb.andWhere('user.isBlocked = :isBlocked', {
          isBlocked: filters.isBlocked,
        });

      if (filters.createdAt) {
        qb.andWhere('user.createdAt::date = :createdAt', {
          createdAt: filters.createdAt,
        });
      }

      const sortBy: UserSortByEnum =
        filters.sortBy ?? UserSortByEnum.CREATED_AT;
      const order: SortOrderEnum = filters.order ?? SortOrderEnum.DESC;
      const sortColumn = UserSortColumnMap[sortBy] ?? 'user.createdAt';
      qb.orderBy(sortColumn, order);

      qb.take(limit).skip(offset);

      qb.distinct(true);

      const [items, total] = await qb.getManyAndCount();

      return {
        items,
        meta: {
          totalItems: total,
          page,
          itemCount: items.length,
          itemsPerPage: Number(limit),
          totalPages:
            total % limit === 0 ? total / limit : Math.ceil(total / limit),
          currentPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Filtered Error');
    }
  }
}
