import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../entities/log.entity';
import { LogType } from '../enums/type.enum';
import { logParams } from '../types/log-params.type';
import { ENTITIES } from '../../common/enums/entities';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Log) private logsRepository: Repository<Log>,
    @Inject(ENTITIES.LOG) private log: typeof Log,
  ) {}

  async error({ message, stack }: Error) {
    const stackParts = stack.split('\n');
    const formattedStack = [];
    for (const part of stackParts) {
      if (part.includes('node_modules')) continue;
      formattedStack.push(part);
    }

    const logInstance = new this.log();
    Object.assign<Log, logParams>(logInstance, {
      message,
      stackTrace: formattedStack.join('\n'),
      type: LogType.EXCEPTION,
    });
    await this.logsRepository.save(logInstance);
  }

  async debug(params: { reason: string; data: string }) {
    const logInstance = new this.log();
    Object.assign<Log, logParams>(logInstance, {
      message: JSON.stringify(params),
      stackTrace: '',
      type: LogType.DEBUG,
    });
    await this.logsRepository.save(logInstance);
  }
}
