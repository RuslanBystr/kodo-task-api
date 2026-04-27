import { WorkspaceMemberResponseDto } from '../dto/workspace-member-response.dto';
import { WorkspaceMember } from '../entities/wokrspace-member.entity';

export class WorkspaceMemberMapper {
  static toDto(entity: WorkspaceMember): WorkspaceMemberResponseDto {
    return {
      id: entity.id,
      role: entity.role,
      joinedAt: entity.joinedAt,
      workspace: {
        id: entity.workspace.id,
        name: entity.workspace.name,
        totalMembers: entity.workspace.totalMembers,
      },
    };
  }
}
