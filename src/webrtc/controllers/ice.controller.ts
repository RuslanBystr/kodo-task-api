import { Controller, Get, Query } from '@nestjs/common';

import { IceService } from '../services/ice.service';

@Controller('webrtc')
export class IceController {
  constructor(private readonly ice: IceService) {}

  @Get('ice')
  getIce(@Query('userId') userId?: string) {
    return this.ice.getIceConfig(userId);
  }
}
