import { TaskStatusEnum } from '../../domain';

export class UpdateTaskDto {
  description?: string;
  status?: TaskStatusEnum;
}
