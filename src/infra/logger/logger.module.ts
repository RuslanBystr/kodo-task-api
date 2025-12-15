import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ENTITIES } from '../../common/enums';
import { Log } from './entities/log.entity';
import { LoggerService } from './services/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [
    LoggerService,
    {
      provide: ENTITIES.LOG,
      useValue: Log,
    },
  ],
  exports: [LoggerService, ENTITIES.LOG, TypeOrmModule.forFeature([Log])],
})
export class LoggerModule {}
