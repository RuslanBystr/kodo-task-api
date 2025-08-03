import { TaskStatusEnum } from '../enums';

export class UpdateTaskDto {
  description?: string;
  status?: TaskStatusEnum;
}
