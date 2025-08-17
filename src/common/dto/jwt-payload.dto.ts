import { UsersRoleEnum } from '../../user/enums';

export class JwtPayloadDto {
  id: number;
  role: UsersRoleEnum;
}
