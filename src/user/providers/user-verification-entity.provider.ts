import { Provider } from '@nestjs/common';
import { ENTITIES } from '../../common/enums';
import { UserVerification } from '../entities/user-verification.entity';

export const userVerificationEntityProvider: Provider = {
  provide: ENTITIES.USER_VERIFICATION,
  useValue: UserVerification,
};
