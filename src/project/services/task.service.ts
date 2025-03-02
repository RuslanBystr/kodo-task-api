import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../../user/entities/user.entity';
import { Project } from '../entities/project.entity';
import { CreateTaskDto, UpdateTaskDto } from '../dto';
import { UserSortByEnum } from '../../user/enums/user-sort.enum';
import { SortOrderEnum } from 'src/common/enums/sort-order.enum';
import { GetAllTasksFilterDto } from '../dto/get-all-tasks.dto';
import { generateSearchConditionsUser } from '../../user/utils/search-condition-users';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const user = await this.userRepo.findOneBy({
      id: Number(createTaskDto.assignedUserId),
    });
    const project = await this.projectRepo.findOneBy({
      id: createTaskDto.projectId,
    });

    if (!user || !project) throw new Error('User or Project not found');

    const task = this.taskRepo.create({
      ...createTaskDto,
      assignedUser: user,
      project,
    });
    return this.taskRepo.save(task);
  }
  public async findAll({
    page = 1,
    limit = 10,
    sortBy = UserSortByEnum.CREATED_AT,
    order = SortOrderEnum.ASC,
    ...searchFilterFields
  }: GetAllTasksFilterDto): Promise<any> {
    const skip = (page - 1) * limit;

    const conditions: FindOptionsWhere<Task> =
      generateSearchConditionsUser<Task>(searchFilterFields);

    const [taskItems, total] = await this.taskRepo.findAndCount({
      select: ['id', 'title', 'description', 'status', 'createdAt'],
      where: conditions,
      relations: ['assignedUser', 'project'],
      skip,
      take: limit,
      order: { [sortBy]: order },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: taskItems,
      meta: {
        totalItems: total,
        itemCount: taskItems.length,
        itemsPerPage: Number(limit),
        totalPages,
        currentPage: Number(page),
      },
    };
  }

  findOne(id: string) {
    return this.taskRepo.findOne({
      where: { id },
      relations: ['assignedUser', 'project'],
    });
  }
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    await this.taskRepo.update(id, updateTaskDto);
    return this.findOne(id);
  }
  async remove(id: string) {
    await this.taskRepo.delete(id);
    return { message: 'Task deleted successfully' };
  }
}
