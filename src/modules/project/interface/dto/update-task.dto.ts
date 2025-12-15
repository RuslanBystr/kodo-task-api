import { IsOptional } from 'class-validator';

import { TaskStatusEnum } from '../../domain';
import { TaskPriority } from '../../infrastructure/entities/task.entity';

export class UpdateTaskDto {
  @IsOptional()
  description?: string;
  @IsOptional()
  status?: TaskStatusEnum;
  @IsOptional()
  priority?: TaskPriority;
}
