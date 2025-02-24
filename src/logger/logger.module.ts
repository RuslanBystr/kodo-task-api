import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { LoggerService } from './services/logger.service';
import { logEntityProvider } from './providers/log-entity.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LoggerService, logEntityProvider],
  exports: [LoggerService, logEntityProvider, TypeOrmModule.forFeature([Log])],
})
export class LoggerModule {}
