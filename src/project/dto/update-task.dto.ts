import { TaskStatusEnum } from '../enums/task-status';

export class UpdateTaskDto {
  description?: string;
  status?: TaskStatusEnum;
}
