import { DataSource } from 'typeorm';
import { runSeeders, Seeder } from 'typeorm-extension';
import { UserSeeder } from './user-seeder';
import { PlanSeeder } from './plan-seeder';

export class MainSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    await runSeeders(dataSource, { seeds: [UserSeeder, PlanSeeder] });
  }
}
