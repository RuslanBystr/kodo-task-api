import { Provider } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { ENTITIES } from '../../common/enums/entities';

export const userEntityProvider: Provider = {
  provide: ENTITIES.USER,
  useValue: User,
};
