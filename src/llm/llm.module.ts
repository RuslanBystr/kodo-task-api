import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LLMService } from './services/llm.service';
import { LLMController } from './controllers/llm.controller';
import { Threads } from './entities/threads.entity';
import { ThreadMessages } from './entities/thread-messages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Threads, ThreadMessages])],
  providers: [LLMService],
  controllers: [LLMController],
})
export class LlmModule {}
