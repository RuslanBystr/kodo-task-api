import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { CONFIG } from '../common/enums/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      configService.get<string>(CONFIG.STRIPE_SECRET_KEY),
      {
        apiVersion: '2025-02-24.acacia',
      },
    );
  }

  async createPaymentIntent(amount: number, currency: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    return paymentIntent;
  }
}
