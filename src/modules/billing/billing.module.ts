import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONFIG } from '../../common/enums';
import { BillingController } from './controllers/billing.controller';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { BillingGuard } from './guards/billing.guard';
import { LiqPayClient } from './liqpay.client';
import { BillingService } from './services/billing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Plan])],
  controllers: [BillingController],
  providers: [
    BillingService,
    BillingGuard,
    {
      provide: LiqPayClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new LiqPayClient(
          configService.get(CONFIG.LIQPAY_PUBLIC),
          configService.get(CONFIG.LIQPAY_PRIVATE),
        ),
    },
  ],
  exports: [BillingGuard],
})
export class BillingModule {}
