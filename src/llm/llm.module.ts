import { Module } from '@nestjs/common';
import { LLMService } from './services/llm.service';
import { LLMController } from './controllers/llm.controller';

@Module({
  providers: [LLMService],
  controllers: [LLMController],
})
export class LlmModule {}
