import { Controller, Get, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ApiTags } from '@nestjs/swagger';
import { ActivityDto } from './dto/activity.dto';

@ApiTags('activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':userId')
  userActivity(@Query() activityDto: ActivityDto) {
    return this.activityService.userActivity(activityDto)
  }
}
