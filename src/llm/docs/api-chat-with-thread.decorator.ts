import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ChatWithThreadApiDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Chat with Gemini using threads (persistent conversation)',
      description:
        'Sends a user message to Gemini. If threadId is omitted, a new thread is created and returned.',
    }),
    ApiOkResponse({
      description: 'Message processed successfully.',
      schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          threadId: {
            type: 'string',
            description: 'ID of the conversation thread',
          },
        },
        example: {
          reply: 'Here is a concise summary of the last sprint...',
          threadId: '874213981245',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Validation error.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'prompt should not be empty' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid authentication.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    ApiBody({
      description: 'User message and optional thread params.',
      schema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'User message to the model' },
          threadId: {
            type: 'string',
            nullable: true,
            description:
              'Existing thread ID. If omitted, a new thread is created.',
          },
          systemPrompt: {
            type: 'string',
            nullable: true,
            description:
              'Optional system instruction applied when creating a new thread.',
          },
        },
        required: ['prompt'],
        example: {
          prompt: "Summarize this week's updates for Project Alpha.",
          threadId: '874213981245',
          systemPrompt: 'You are a concise project assistant.',
        },
      },
    }),
  );
}
