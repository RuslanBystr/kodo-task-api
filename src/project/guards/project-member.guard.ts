import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly projectService: ProjectService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest();
    const userId = user?.id;
    const projectId = params.id;

    if (!userId || !projectId) {
      throw new ForbiddenException('Missing userId or projectId');
    }

    const isMember = await this.projectService.isUserMember(projectId, userId);

    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return true;
  }
}
