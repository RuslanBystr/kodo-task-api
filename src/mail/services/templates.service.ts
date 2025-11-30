import { Inject, Injectable } from '@nestjs/common';

import { ADDITIONAL_PROVIDERS } from '../../common/enums';
import { templateName, Templates } from '../templates';

@Injectable()
export class TemplatesService {
  constructor(
    @Inject(ADDITIONAL_PROVIDERS.TEMPLATES) private templates: Templates,
  ) {}

  getTemplate(template: templateName) {
    return this.templates.get(template);
  }
}
