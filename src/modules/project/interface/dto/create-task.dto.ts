import { TaskPriority } from '../../infrastructure/entities/task.entity';

export class CreateTaskDto {
  title: string;
  description?: string;
  estimate: number;
  priority: TaskPriority;
  projectId: string;
  assignedUserId: number;
}
