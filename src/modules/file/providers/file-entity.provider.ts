import { Provider } from '@nestjs/common';

import { ENTITIES } from '../../../common/enums';
import { FileEntity } from '../entities/file.entity';

export const fileEntityProvider: Provider = {
  provide: ENTITIES.FILE_ENTITY,
  useValue: FileEntity,
};
