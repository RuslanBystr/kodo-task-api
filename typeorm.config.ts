import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SeederOptions } from 'typeorm-extension';
import { CONFIG } from './src/common/enums/config';
import { MainSeeder } from './src/seeds/main-seeder';
import { User } from './src/user/entities/user.entity';
import { config } from 'dotenv';
import { UserVerification } from './src/user/entities/user-verification.entity';
import { FileEntity } from './src/file/entities/file.entity';
import { CreateAndVerifyUser1740301060631 } from './migrations/1740301060631-create-and-verify-user';
import { CreateFileEntity1740301416004 } from './migrations/1740301416004-create-file-entity';
import { Log } from './src/logger/entities/log.entity';
import { CreateLoggerEntity1740301521390 } from './migrations/1740301521390-create-logger-entity';

config();
const configService = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: configService.get(CONFIG.POSTGRES_HOST),
  port: configService.get(CONFIG.POSTGRES_PORT),
  username: configService.get(CONFIG.POSTGRES_USER),
  password: configService.get(CONFIG.POSTGRES_PASSWORD),
  database: configService.get(CONFIG.POSTGRES_DB),
  entities: [
    User,
    UserVerification,
    FileEntity,
    Log
  ],
  migrations: [
    CreateAndVerifyUser1740301060631,
    CreateFileEntity1740301416004,
    CreateLoggerEntity1740301521390
  ],
  seeds: [MainSeeder],
};

export default new DataSource(options);
