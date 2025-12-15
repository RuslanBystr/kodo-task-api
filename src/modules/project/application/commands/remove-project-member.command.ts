import { RemoveProjectMemberDto } from '../../interface/dto';
export class RemoveProjectMemberCommand {
  constructor(
    public readonly projectId: string,
    public readonly dto: RemoveProjectMemberDto,
    public readonly currentUserId: number,
  ) {}
}
