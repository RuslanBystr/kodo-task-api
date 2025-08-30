import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActivityService } from './activity.service';

@ApiTags('activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':userId')
  userActivity(@Param('userId', ParseIntPipe) userId: number) {
    return this.activityService.userActivity(userId);
  }
}
