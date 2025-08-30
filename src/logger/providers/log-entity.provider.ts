import { Provider } from '@nestjs/common';

import { ENTITIES } from '../../common/enums';
import { Log } from '../entities/log.entity';

export const logEntityProvider: Provider = {
  provide: ENTITIES.LOG,
  useValue: Log,
};
