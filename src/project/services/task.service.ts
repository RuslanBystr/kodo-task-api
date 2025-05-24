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
import { CreateTaskDto, UpdateTaskDto } from '../dto';
import { SortOrderEnum } from 'src/common/enums/sort-order.enum';
import { GetAllTasksFilterDto } from '../dto/get-all-tasks.dto';
import { generateSearchConditionsUser } from '../../user/utils/search-condition-users';
import { TaskSortByEnum } from '../enums/task-sort-by.enum';
import { SetTimeDto } from '../dto/set-time.dto';
import { TaskLog } from '../entities/task-log.entity';

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

  public async findAll({
    page = 1,
    limit = 20,
    sortBy = TaskSortByEnum.CREATED_AT,
    order = SortOrderEnum.DESC,
    assignedTo,
    projectId = undefined,
    ...searchFilterFields
  }: GetAllTasksFilterDto): Promise<any> {
    const skip = (page - 1) * limit;

    const baseConditions: FindOptionsWhere<Task> =
      generateSearchConditionsUser<Task>(searchFilterFields);

    const conditions: FindOptionsWhere<Task> = {
      ...baseConditions,
    };

    try {
      const [taskItems, total] = await this.taskRepo.findAndCount({
        where: {
          ...conditions,
          project: projectId ? { id: projectId } : undefined,
          assignedUser: assignedTo ? { id: assignedTo } : undefined,
        },
        relations: ['assignedUser', 'project'],
        skip,
        take: limit,
        order: {
          status: SortOrderEnum.ASC,
          [sortBy]: order,
        },
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

  async updateTaskTime(id: string, setTimeDto: SetTimeDto): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
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
