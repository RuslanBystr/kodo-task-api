import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetProjectMembersQuery } from '../../application/queries/get-project-members.query';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly query: QueryBus) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest();
    const userId = user?.id;
    const projectId = params.id;

    if (!userId || !projectId) {
      throw new ForbiddenException('Missing userId or projectId');
    }

    const isMember = await this.query.execute(
      new GetProjectMembersQuery(projectId, userId),
    );

    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return true;
  }
}
