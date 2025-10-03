import { Module } from '@nestjs/common';

import { IceController } from './controllers/ice.controller';
import { IceService } from './services/ice.service';

@Module({
  controllers: [IceController],
  providers: [IceService],
})
export class WebrtcModule {}
