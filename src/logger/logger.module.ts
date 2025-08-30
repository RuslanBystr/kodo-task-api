import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Log } from './entities/log.entity';
import { logEntityProvider } from './providers/log-entity.provider';
import { LoggerService } from './services/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LoggerService, logEntityProvider],
  exports: [LoggerService, logEntityProvider, TypeOrmModule.forFeature([Log])],
})
export class LoggerModule {}
