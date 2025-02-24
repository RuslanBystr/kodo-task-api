import { Inject, Injectable } from '@nestjs/common';
import { Templates, templateName } from '../templates';
import { ADDITIONAL_PROVIDERS } from '../../common/enums/additional-providers';

@Injectable()
export class TemplatesService {
  constructor(
    @Inject(ADDITIONAL_PROVIDERS.TEMPLATES) private templates: Templates,
  ) {}

  getTemplate(template: templateName) {
    return this.templates.get(template);
  }
}
