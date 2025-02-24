import { ConfigService } from '@nestjs/config';
import { CONFIG } from '../../common/enums/config';
import { Provider } from '@nestjs/common';

import { ADDITIONAL_PROVIDERS } from '../../common/enums/additional-providers';
import * as SendGrid from '@sendgrid/mail';

export const MailingProvider: Provider = {
  provide: ADDITIONAL_PROVIDERS.SENDGRID,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.get(CONFIG.SENDGRID_API_KEY);
    return SendGrid.setApiKey(apiKey);
  },
};
