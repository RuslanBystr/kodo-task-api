import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateTaskCommand } from './update-task.command';
import { Task } from '../../infrastructure/entities/task.entity';

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async execute(c: UpdateTaskCommand) {
    await this.taskRepo.update(c.id, c.dto);
    return this.taskRepo.findOne({
      where: { id: c.id },
      relations: ['assignedUser', 'project', 'timeLogger'],
    });
  }
}
