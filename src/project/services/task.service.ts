import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../../user/entities/user.entity';
import { Project } from '../entities/project.entity';
import { TaskLog } from '../entities/task-log.entity';
import { generateSearchConditions } from '../../common/utils';
import { TaskSortByEnum } from '../enums';
import { SortOrderEnum } from 'src/common/enums';
import {
  CreateTaskDto,
  GetAllTasksFilterDto,
  SetTimeDto,
  UpdateTaskDto,
} from '../dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(TaskLog) private taskLogRepo: Repository<TaskLog>,
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

  public async findAll(
    userId: number,
    {
      page = 1,
      limit = 20,
      sortBy = TaskSortByEnum.CREATED_AT,
      order = SortOrderEnum.DESC,
      projectId,
      ...searchFilterFields
    }: GetAllTasksFilterDto,
  ): Promise<{
    items: Task[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    const pageNum = Number(page) || 1;
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const sortKey = Object.values(TaskSortByEnum).includes(sortBy)
      ? sortBy
      : TaskSortByEnum.CREATED_AT;
    const sortDirection = Object.values(SortOrderEnum).includes(order)
      ? order
      : SortOrderEnum.DESC;

    const baseConditions: FindOptionsWhere<Task> =
      generateSearchConditions<Task>(searchFilterFields);

    try {
      const [taskItems, total] = await this.taskRepo.findAndCount({
        where: {
          ...baseConditions,
          ...(projectId ? { project: { id: projectId } } : {}),
          assignedUser: { id: Number(userId) },
        },
        relations: ['assignedUser', 'project'],
        skip,
        take: limitNum,
        order: {
          status: SortOrderEnum.ASC,
          [sortKey]: sortDirection,
        },
      });

      const totalPages = Math.ceil(total / limitNum) || 1;

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
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while fetching tasks',
      );
    }
  }

  findOne(id: string) {
    return this.taskRepo.findOne({
      where: { id },
      relations: ['assignedUser', 'project', 'timeLogger'],
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

  async updateTaskTime(
    userId: number,
    taskId: string,
    setTimeDto: SetTimeDto,
  ): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, assignedUser: { id: userId } },
      relations: ['assignedUser'],
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    task.spentTime += setTimeDto.duration;
    task.remaining = Math.max(task.estimate - task.spentTime, 0);

    await this.taskRepo.save(task);

    const logEntry = this.taskLogRepo.create({
      duration: setTimeDto.duration,
      task: task,
    });

    await this.taskLogRepo.save(logEntry);

    return task;
  }

  async removeLog(id: string) {
    const logEntry = await this.taskLogRepo.findOne({
      where: { id },
      relations: ['task'],
    });

    if (!logEntry) {
      throw new NotFoundException(`Log with id ${id} not found`);
    }

    const task = logEntry.task;
    if (!task) {
      throw new NotFoundException(
        `Task associated with log id ${id} not found`,
      );
    }

    task.spentTime = Math.max(task.spentTime - logEntry.duration, 0);
    task.remaining = Math.max(task.estimate - task.spentTime, 0);

    await this.taskRepo.save(task);
    await this.taskLogRepo.delete(id);

    return { message: 'Task log deleted successfully', updatedTask: task };
  }
}
