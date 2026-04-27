import { WorkspaceRole } from '../entities/wokrspace-member.entity';

export class WorkspaceMemberResponseDto {
  id: string;
  role: WorkspaceRole;
  joinedAt: Date;

  workspace: {
    id: string;
    name: string;
    totalMembers: number;
  };
}
