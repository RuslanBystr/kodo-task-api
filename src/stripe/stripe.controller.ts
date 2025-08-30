import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards';
import { StripeService } from './stripe.service';

@ApiTags('payments')
@Controller('payments')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number }) {
    return await this.stripeService.createPaymentIntent(body.amount, 'usd');
  }
}
