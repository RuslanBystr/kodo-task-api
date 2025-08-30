import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function FindThreadsApiDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List user threads',
      description:
        'Returns user-owned threads ordered by updated_at desc with pagination.',
    }),
    ApiBearerAuth(),
    ApiQuery({ name: 'offset', required: false, type: Number, example: 0 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      description: 'Search in title/summary',
    }),
    ApiOkResponse({
      description: 'Threads page',
      schema: {
        type: 'object',
        properties: {
          total: { type: 'number' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string', nullable: true },
                system_prompt: { type: 'string', nullable: true },
                summary: { type: 'string', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
              },
            },
          },
          nextOffset: { type: 'number', nullable: true },
          hasMore: { type: 'boolean' },
        },
        example: {
          total: 42,
          items: [
            {
              id: '874213981245',
              title: 'Sprint planning',
              system_prompt: null,
              summary: 'Conversation summary…',
              created_at: '2025-08-20T09:00:00.000Z',
              updated_at: '2025-08-23T18:21:45.000Z',
            },
          ],
          nextOffset: 20,
          hasMore: true,
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
