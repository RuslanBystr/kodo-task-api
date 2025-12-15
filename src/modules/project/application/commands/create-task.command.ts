import { TaskPriority } from '../../infrastructure/entities/task.entity';

export class CreateTaskCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly estimate: number,
    public readonly priority: TaskPriority,
    public readonly projectId: string,
    public readonly assignedUserId: number,
  ) {}
}
