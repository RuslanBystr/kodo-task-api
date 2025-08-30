import { GetAllUsersFilterDto } from '../../../user/dto';

export class GetAllMembersQuery {
  constructor(
    public readonly userId: number,
    public readonly filters: GetAllUsersFilterDto,
    public readonly projectId?: string,
  ) {}
}

export enum UserSortByEnum {
  CREATED_AT = 'createdAt',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  EMAIL = 'email',
}
export const UserSortColumnMap: Record<UserSortByEnum, string> = {
  [UserSortByEnum.CREATED_AT]: 'user.createdAt',
  [UserSortByEnum.FIRST_NAME]: 'user.firstName',
  [UserSortByEnum.LAST_NAME]: 'user.lastName',
  [UserSortByEnum.EMAIL]: 'user.email',
};

