import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

import { ADDITIONAL_PROVIDERS, CONFIG } from '../../common/enums';

export const MailingProvider: Provider = {
  provide: ADDITIONAL_PROVIDERS.SENDGRID,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.get(CONFIG.SENDGRID_API_KEY);
    return SendGrid.setApiKey(apiKey);
  },
};
