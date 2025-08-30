import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONFIG } from '../common/enums';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get(CONFIG.POSTGRES_HOST),
        port: configService.get(CONFIG.POSTGRES_PORT),
        username: configService.get(CONFIG.POSTGRES_USER),
        password: configService.get(CONFIG.POSTGRES_PASSWORD),
        database: configService.get(CONFIG.POSTGRES_DB),
        entities: [],
        //subscribers: [],
        autoLoadEntities: true,
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
