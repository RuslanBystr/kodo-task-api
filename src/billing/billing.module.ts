import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './controllers/billing.controller';
import { BillingService } from './services/billing.service';
import { BillingGuard } from './guards/billing.guard';
import { Subscription } from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { LiqPayClient } from './liqpay.client';
import { ConfigService } from '@nestjs/config';

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
          configService.get('LIQPAY_PUBLIC')!,
          configService.get('LIQPAY_PRIVATE')!,
        ),
    },
  ],
  exports: [BillingGuard],
})
export class BillingModule {}
