import { Module } from '@nestjs/common';

import { IceService } from './services/ice.service';

@Module({
  providers: [IceService],
})
export class WebrtcModule {}
