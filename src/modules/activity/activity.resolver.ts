import { InternalServerErrorException } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { ActivityService } from './activity.service';
import { ActivitySummary } from './dto';

@Resolver(() => ActivitySummary)
export class ActivityResolver {
  constructor(private readonly activityService: ActivityService) {}

  @Query(() => [ActivitySummary], { name: 'userActivity' })
  async userActivity(@Args('userId', { type: () => Int }) userId: number) {
    try {
      const rows = await this.activityService.userActivity(userId);
      return (rows || []).map((r: any) => {
        const total =
          typeof r.totaltime !== 'undefined'
            ? Number(r.totaltime)
            : typeof r.totaltime !== 'undefined'
              ? Number(r.totaltime)
              : typeof r.totalTime !== 'undefined'
                ? Number(r.totalTime)
                : 0;
        return {
          date: r.date,
          totalTime: Number.isFinite(total) ? Math.round(total) : 0,
        };
      });
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message || 'Internal error');
    }
  }
}
