import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskTimeCommand } from './update-task-time.command';
import { Task } from '../../infrastructure/entities/task.entity';
import { TaskLog } from '../../infrastructure/entities/task-log.entity';

@CommandHandler(UpdateTaskTimeCommand)
export class UpdateTaskTimeHandler
  implements ICommandHandler<UpdateTaskTimeCommand>
{
  constructor(private readonly dataSource: DataSource) {}

  async execute(c: UpdateTaskTimeCommand) {
    return this.dataSource.transaction(async (manager) => {
      const taskRepo = manager.getRepository(Task);
      const logRepo = manager.getRepository(TaskLog);

      const task = await taskRepo.findOne({
        where: { id: c.taskId, assignedUser: { id: c.userId as any } },
        relations: ['assignedUser'],
      });
      if (!task)
        throw new NotFoundException(`Task with id ${c.taskId} not found`);

      task.spentTime += c.dto.duration;
      task.remaining = Math.max(task.estimate - task.spentTime, 0);
      await taskRepo.save(task);

      const logEntry = logRepo.create({ duration: c.dto.duration, task });
      await logRepo.save(logEntry);

      return task;
    });
  }
}
