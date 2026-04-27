import { IsString } from 'class-validator';

import { WorkspaceRole } from '../entities/wokrspace-member.entity';

export const INVITABLE_ROLES = [
  WorkspaceRole.ADMIN,
  WorkspaceRole.MEMBER,
  WorkspaceRole.VIEWER,
] as const;

export type InvitableWorkspaceRole = (typeof INVITABLE_ROLES)[number];

export class InviteWorkspaceMemberDto {
  @IsString()
  workspaceId: string;

  @IsString()
  email: string;

  @IsString()
  role: InvitableWorkspaceRole;
}
