import { Provider } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { LIBS } from '../../../enums';

export const bcryptProvider: Provider = {
  provide: LIBS.BCRYPT,
  useValue: bcrypt,
};
