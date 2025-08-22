import { Body, Controller, Post } from '@nestjs/common';
import { LLMService } from '../services/llm.service';
import { GenerateTextApiDocs } from '../docs/api-generate.decorator';

@Controller('llm')
export class LLMController {
  constructor(private llmService: LLMService) {}

  @Post('generate')
  @GenerateTextApiDocs()
  async generate(@Body('prompt') prompt: string): Promise<any> {
    if (!prompt) {
      return { error: 'Prompt is required.' };
    }
    const text = await this.llmService.generateText(prompt);
    return { generatedText: text };
  }
}
