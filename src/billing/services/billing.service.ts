import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { Plan } from '../entities/plan.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { LiqPayClient } from '../liqpay.client';
import { CONFIG } from '../../common/enums';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subsRepo: Repository<Subscription>,
    @InjectRepository(Plan) private readonly planRepo: Repository<Plan>,
    private readonly liqpay: LiqPayClient,
    private readonly configService: ConfigService,
  ) {}

  async createCheckout(user_id: string, plan_id: string) {
    if (!user_id) throw new UnauthorizedException('Missing user_id');
    try {
      const plan = await this.planRepo.findOneBy({ id: plan_id });
      if (!plan) throw new BadRequestException('Plan not found');

      const order_id = `sub_${user_id}_${Date.now()}`;

      const sub = this.subsRepo.create({
        user_id,
        plan,
        status: SubscriptionStatus.PENDING,
        liqpay_order_id: order_id,
      });
      await this.subsRepo.save(sub);

      const payload = {
        public_key: this.configService.get(CONFIG.LIQPAY_PUBLIC)!,
        version: 3,
        action: 'pay',
        amount: Number(plan.price),
        currency: plan.currency,
        description: `Subscription (${plan.code})`,
        order_id,
        recurringbytoken: '1',
        server_url: `${process.env.FRONTEND_URL}/billing/webhook`,
        result_url: `${process.env.FRONTEND_URL}/billing/success`,
        sandbox: '1', // test mode
      };

      // повертаємо data/signature — фронт підставить у форму LiqPay
      return this.liqpay.buildCheckoutPayload(payload);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Обробка вебхука від LiqPay
   * LiqPay шле { data, signature }
   */
  async handleWebhook(data: string, signature: string) {
    if (!this.liqpay.verifySignature(data, signature)) {
      this.logger.warn('Invalid LiqPay signature');
      throw new BadRequestException('Invalid signature');
    }

    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));

    const { order_id, status, card_token, transaction_id } = payload as {
      order_id: string;
      status: string;
      card_token?: string;
      transaction_id?: string;
    };

    const sub = await this.subsRepo.findOne({
      where: { liqpay_order_id: order_id },
      relations: { plan: true },
    });
    if (!sub) {
      this.logger.warn(`Subscription not found by order_id=${order_id}`);
      return 'ok';
    }

    if (status === 'success' || status === 'subscribed') {
      sub.status = SubscriptionStatus.ACTIVE;
      sub.active_until = this.addDays(new Date(), sub.plan.period_days);
      if (card_token) sub.liqpay_card_token = card_token;
      if (transaction_id) sub.liqpay_transaction_id = transaction_id;
    } else if (
      status === 'failure' ||
      status === 'error' ||
      status === 'expired'
    ) {
      sub.status =
        status === 'expired'
          ? SubscriptionStatus.EXPIRED
          : SubscriptionStatus.FAILED;
    }

    await this.subsRepo.save(sub);
    return 'ok';
  }

  async cancel(user_id: string) {
    const sub = await this.subsRepo.findOne({
      where: { user_id, status: SubscriptionStatus.ACTIVE },
    });
    if (!sub) throw new BadRequestException('Active subscription not found');
    sub.status = SubscriptionStatus.CANCELED;
    await this.subsRepo.save(sub);
    return { ok: true };
  }

  async getStatus(user_id: string) {
    const sub = await this.subsRepo.findOne({
      where: { user_id },
      order: { updated_at: 'DESC' },
    });
    return sub ?? null;
  }

  /**
   * Call using CRON
   */
  async renewExpiring() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);

    const expiring = await this.subsRepo.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        active_until: LessThanOrEqual(tomorrow),
      },
      relations: { plan: true },
    });

    for (const sub of expiring) {
      if (!sub.liqpay_card_token) {
        this.logger.warn(`No card_token for sub=${sub.id}, cannot renew`);
        continue;
      }
      // 1) Сформувати LiqPay "request" (action: pay, recurringbytoken, card_token, order_id ...).
      // 2) За успіху — продовжити active_until на plan.period_days.
      // 3) За фейлу — проставити FAILED та сповістити користувача.
      // Тут залишаю як TODO, бо залежить від вашого флоу/нотифікацій.
    }
  }

  private addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }
}
