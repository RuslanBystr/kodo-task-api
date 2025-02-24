import { Provider } from '@nestjs/common';
import { FileEntity } from '../entities/file.entity';
import { ENTITIES } from '../../common/enums/entities';

export const fileEntityProvider: Provider = {
  provide: ENTITIES.FILE_ENTITY,
  useValue: FileEntity,
};
