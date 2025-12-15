import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ChatHistoryApiDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get chat history for a thread',
      description:
        'Returns the latest messages for the given thread. Use `before` cursor to paginate older messages.',
    }),
    ApiQuery({ name: 'threadId', required: true, type: String }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 30 }),
    ApiQuery({
      name: 'before',
      required: false,
      type: String,
      description:
        'ISO timestamp. Returns messages created before this moment.',
      example: '2025-08-23T18:20:00.000Z',
    }),
    ApiOkResponse({
      description: 'History loaded.',
      schema: {
        type: 'object',
        properties: {
          threadId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                role: { type: 'string', enum: ['user', 'model', 'system'] },
                content: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
              },
            },
          },
          nextCursor: {
            type: 'string',
            nullable: true,
            description: 'Pass this as `before` to fetch older messages.',
          },
        },
        example: {
          threadId: '874213981245',
          items: [
            {
              id: 'uuid-1',
              role: 'user',
              content: 'Hi!',
              created_at: '2025-08-23T18:19:10.000Z',
            },
            {
              id: 'uuid-2',
              role: 'model',
              content: 'Hello 👋',
              created_at: '2025-08-23T18:19:11.200Z',
            },
          ],
          nextCursor: '2025-08-23T18:19:10.000Z',
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Validation error' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
