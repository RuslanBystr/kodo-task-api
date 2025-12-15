import { SetTimeDto } from '../../interface/dto';
export class UpdateTaskTimeCommand {
  constructor(
    public readonly userId: number,
    public readonly taskId: string,
    public readonly dto: SetTimeDto,
  ) {}
}
