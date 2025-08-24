import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetTaskByIdQuery } from './get-task-by-id.query';
import { Task } from '../../infrastructure/entities/task.entity';

@QueryHandler(GetTaskByIdQuery)
export class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery> {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async execute(q: GetTaskByIdQuery) {
    return this.taskRepo.findOne({
      where: { id: q.id },
      relations: ['assignedUser', 'project', 'timeLogger'],
    });
  }
}
