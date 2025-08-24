import { UpdateProjectDto } from '../../interface/dto';
export class UpdateProjectCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateProjectDto,
  ) {}
}
