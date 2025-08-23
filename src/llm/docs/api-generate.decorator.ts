import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

export function GenerateTextApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Generate text using the Gemini API' }),
    ApiOkResponse({
      description: 'The text was successfully generated.',
      schema: {
        type: 'object',
        properties: {
          generatedText: { type: 'string' },
        },
        example: {
          generatedText: 'This is an example of a generated text.',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'The prompt is required.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        example: {
          error: 'Prompt is required.',
        },
      },
    }),
    ApiBody({
      description: 'The prompt to be sent to the Gemini model.',
      schema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
        },
        example: {
          prompt: 'Write a short story about a robot.',
        },
      },
    }),
  );
}
