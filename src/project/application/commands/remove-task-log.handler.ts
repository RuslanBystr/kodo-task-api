import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';

import { Task } from '../../infrastructure/entities/task.entity';
import { TaskLog } from '../../infrastructure/entities/task-log.entity';
import { RemoveTaskLogCommand } from './remove-task-log.command';

@CommandHandler(RemoveTaskLogCommand)
export class RemoveTaskLogHandler
  implements ICommandHandler<RemoveTaskLogCommand>
{
  constructor(private readonly dataSource: DataSource) {}

  async execute(c: RemoveTaskLogCommand) {
    return this.dataSource.transaction(async (manager) => {
      const logRepo = manager.getRepository(TaskLog);
      const taskRepo = manager.getRepository(Task);

      const logEntry = await logRepo.findOne({
        where: { id: c.logId },
        relations: ['task'],
      });
      if (!logEntry)
        throw new NotFoundException(`Log with id ${c.logId} not found`);

      const task = logEntry.task;
      if (!task)
        throw new NotFoundException(
          `Task associated with log id ${c.logId} not found`,
        );

      task.spentTime = Math.max(task.spentTime - logEntry.duration, 0);
      task.remaining = Math.max(task.estimate - task.spentTime, 0);

      await taskRepo.save(task);
      await logRepo.delete(c.logId);

      return { message: 'Task log deleted successfully', updatedTask: task };
    });
  }
}
