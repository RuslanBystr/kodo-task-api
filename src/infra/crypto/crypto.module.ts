import { Module } from '@nestjs/common';

import { CryptoAdapter } from './crypto.adapter';

@Module({
  providers: [CryptoAdapter],
})
export class CryptoModule {}
