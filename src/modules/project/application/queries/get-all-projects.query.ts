import { GetAllProjectsFilterDto } from '../../interface/dto';

export class GetAllProjectsQuery {
  constructor(
    public readonly filters: GetAllProjectsFilterDto,
    public readonly userId: number,
  ) {}
}
