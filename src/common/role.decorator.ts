import { SetMetadata } from '@nestjs/common';

import { UsersRoleEnum } from '../modules/user/enums';

export const ROLES_KEY = 'roles';
export const Role = (...roles: UsersRoleEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
