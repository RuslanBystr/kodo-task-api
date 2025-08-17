import { SetMetadata } from '@nestjs/common';
import { UsersRoleEnum } from '../user/enums';

export const ROLES_KEY = 'roles';
export const Role = (...roles: UsersRoleEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
