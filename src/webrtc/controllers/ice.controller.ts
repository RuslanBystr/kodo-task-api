import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/guards';
import { ApiGetIce } from '../docs/api-get-ice.decorator';
import { IceService } from '../services/ice.service';

@Controller('webrtc')
export class IceController {
  constructor(private readonly ice: IceService) {}

  @Get('ice')
  @UseGuards(JwtAuthGuard)
  @ApiGetIce()
  getIce(@Req() req: Request) {
    return this.ice.getIceConfig(req.user.id);
  }
}
