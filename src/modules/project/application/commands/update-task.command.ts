import { UpdateTaskDto } from '../../interface/dto';
export class UpdateTaskCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateTaskDto,
  ) {}
}
