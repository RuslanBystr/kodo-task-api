import { AddProjectMemberDto } from '../../interface/dto';
export class AddProjectMemberCommand {
  constructor(
    public readonly projectId: string,
    public readonly dto: AddProjectMemberDto,
    public readonly currentUserId: number,
  ) {}
}
