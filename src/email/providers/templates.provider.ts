import { Provider } from '@nestjs/common';
import { templates } from '../templates';
import { ADDITIONAL_PROVIDERS } from '../../common/enums/additional-providers';

export const templatesProvider: Provider = {
  provide: ADDITIONAL_PROVIDERS.TEMPLATES,
  useValue: templates,
};
