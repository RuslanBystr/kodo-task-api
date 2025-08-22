import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LLMService {
  private readonly gemini: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined in the environment variables.',
      );
    }

    this.gemini = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const model = this.gemini.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error while generating text:', error);
      throw new Error('Failed to generate text using Gemini API.');
    }
  }
}