import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LLMController } from './controllers/llm.controller';
import { ThreadMessages } from './entities/thread-messages.entity';
import { Threads } from './entities/threads.entity';
import { LLMService } from './services/llm.service';

@Module({
  imports: [TypeOrmModule.forFeature([Threads, ThreadMessages])],
  providers: [LLMService],
  controllers: [LLMController],
})
export class LlmModule {}
