import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../../../common/role.decorator';
import { UsersRoleEnum } from '../../user/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UsersRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new UnauthorizedException('Unathorized in guard');

    const userRoles: UsersRoleEnum[] = Array.isArray(user.roles)
      ? user.roles
      : user?.role
        ? [user.role]
        : [];

    const allowed = requiredRoles.some((r) => userRoles.includes(r));
    if (!allowed) throw new ForbiddenException('Insufficient role');

    return true;
  }
}
