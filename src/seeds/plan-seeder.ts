import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Plan } from '../billing/entities/plan.entity';

export class PlanSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Plan);

    const CURRENCY = process.env.BILLING_CURRENCY ?? 'USD';
    const PRO_PRICE = Number(process.env.PLAN_PRO_PRICE ?? 9); // 9 USD
    const PRO_PERIOD = Number(process.env.PLAN_PRO_PERIOD_DAYS ?? 30);

    const PROF_PRICE = Number(process.env.PLAN_PROFESSIONAL_PRICE ?? 19); // 19 USD
    const PROF_PERIOD = Number(process.env.PLAN_PROFESSIONAL_PERIOD_DAYS ?? 30);

    const items: Array<Partial<Plan>> = [
      {
        code: 'pro',
        price: PRO_PRICE,
        currency: CURRENCY,
        period_days: PRO_PERIOD,
      },
      {
        code: 'professional',
        price: PROF_PRICE,
        currency: CURRENCY,
        period_days: PROF_PERIOD,
      },
    ];

    await repo.upsert(items, { conflictPaths: ['code'] });
  }
}
