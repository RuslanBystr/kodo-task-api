import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':userId')
  userActivity(@Param('userId', ParseIntPipe) userId: number) {
    return this.activityService.userActivity(userId);
  }
}
