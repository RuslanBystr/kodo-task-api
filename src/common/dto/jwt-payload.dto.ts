import { UsersRoleEnum } from '../../user/enums/users-role.enum';

export class JwtPayloadDto {
  id: number;
  role?: UsersRoleEnum;
}
