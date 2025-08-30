import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

@Injectable()
export class BillingGuard implements CanActivate {
  constructor(
    @InjectRepository(Subscription)
    private readonly subsRepo: Repository<Subscription>,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<any>();
    const user_id: string = req.user?.userId;
    if (!user_id) return false;

    const now = new Date();
    const sub = await this.subsRepo.findOne({
      where: {
        user_id,
        status: SubscriptionStatus.ACTIVE,
        active_until: MoreThan(now),
      },
    });
    return !!sub;
  }
}
