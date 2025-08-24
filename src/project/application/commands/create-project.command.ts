import { CreateProjectDto } from '../../interface/dto';
export class CreateProjectCommand {
  constructor(
    public readonly dto: CreateProjectDto,
    public readonly userId: number,
  ) {}
}
