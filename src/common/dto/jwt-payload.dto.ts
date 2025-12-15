import { UsersRoleEnum } from '../../modules/user/enums';

export class JwtPayloadDto {
  id: number;
  role: UsersRoleEnum;
}
