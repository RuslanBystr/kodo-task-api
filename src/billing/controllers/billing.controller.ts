import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from '../services/billing.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { BillingGuard } from '../guards/billing.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { JwtAuthGuard } from '../../auth/guards';

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}
  @Get('plans')
  @UseGuards(JwtAuthGuard)
  async listPlans(@InjectRepository(Plan) repo: Repository<Plan>) {
    return repo.find({
      select: ['id', 'code', 'price', 'currency', 'period_days'],
    });
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@Req() req: any, @Body() dto: CreateCheckoutDto) {
    const user_id: string = req.user.id;

    if (!user_id) throw new UnauthorizedException('No user in request');

    return this.billing.createCheckout(user_id, dto.plan_id);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: { data: string; signature: string }) {
    await this.billing.handleWebhook(body.data, body.signature);
    return 'ok';
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Req() req: any) {
    const user_id: string = req.user.userId;
    return this.billing.cancel(user_id);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: any) {
    const user_id: string = req.user.userId;
    return this.billing.getStatus(user_id);
  }

  @Get('pro-only')
  @UseGuards(BillingGuard)
  pingPaid() {
    return { ok: true, msg: 'You have access (active subscription).' };
  }
}
