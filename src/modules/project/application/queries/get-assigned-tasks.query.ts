import { GetAllTasksFilterDto } from '../../interface/dto';

export class GetAssignedTasksQuery {
  constructor(
    public readonly userId: number,
    public readonly filters: GetAllTasksFilterDto,
  ) {}
}
