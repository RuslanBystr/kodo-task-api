import { Provider } from '@nestjs/common';

import { ADDITIONAL_PROVIDERS } from '../../common/enums';
import { templates } from '../templates';

export const templatesProvider: Provider = {
  provide: ADDITIONAL_PROVIDERS.TEMPLATES,
  useValue: templates,
};
