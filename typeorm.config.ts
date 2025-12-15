import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

import { CONFIG } from './src/common/enums';
import { MainSeeder } from './src/infra/seeds/main-seeder';

config();
const configService = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: configService.get(CONFIG.POSTGRES_HOST),
  port: configService.get(CONFIG.POSTGRES_PORT),
  username: configService.get(CONFIG.POSTGRES_USER),
  password: configService.get(CONFIG.POSTGRES_PASSWORD),
  database: configService.get(CONFIG.POSTGRES_DB),
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  seeds: [MainSeeder],
};

export default new DataSource(options);
