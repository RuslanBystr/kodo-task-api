import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteTaskCommand } from './delete-task.command';
import { Task } from '../../infrastructure/entities/task.entity';

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand> {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async execute(c: DeleteTaskCommand) {
    await this.taskRepo.delete(c.id);
    return { message: 'Task deleted successfully' };
  }
}
