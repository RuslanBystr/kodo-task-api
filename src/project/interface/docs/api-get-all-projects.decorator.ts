import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SortOrderEnum } from '../../../common/enums';
import { TaskStatusEnum } from '../../domain';

export function ApiGetAllProjects() {
  return applyDecorators(
    ApiExtraModels(),
    ApiOperation({
      summary: 'Get all projects',
      description: 'Returns paginated list of projects where the authenticated user is a member',
    }),
    ApiBearerAuth(),
    ApiQuery({ name: 'id', required: false, type: Number }),
    ApiQuery({ name: 'name', required: false, type: String }),
    ApiQuery({ name: 'description', required: false, type: String }),
    ApiQuery({
      name: 'createdAt',
      required: false,
      type: String,
      description: 'ISO date string',
    }),
    ApiQuery({ name: 'status', required: false, enum: TaskStatusEnum }),
    ApiQuery({ name: 'order', required: false, enum: SortOrderEnum }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (default 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (default 10)',
    }),

    // Ok response: paginated object with items[] and meta
    ApiOkResponse({
      description: 'Paginated projects response',
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 42 },
                name: { type: 'string', example: 'AI Assistant Platform' },
                description: { type: 'string', example: 'Platform for managing AI prompts and agents' },
                image: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                createdAt: { type: 'string', format: 'date-time', example: '2025-11-01T08:00:00.000Z' },
                // minimal owner
                owner: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 7 },
                    email: { type: 'string', example: 'owner@example.com' },
                  },
                },
                // members list (minimal)
                members: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 9 },
                      email: { type: 'string', example: 'teammate@example.com' },
                    },
                  },
                },
                // you already load relations tasks in handler — include count if needed
                tasks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 101 },
                      title: { type: 'string', example: 'Setup CI' },
                      status: { type: 'string', example: 'OPEN' },
                    },
                  },
                },
              },
            },
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 5 },
              itemCount: { type: 'number', example: 5 },
              itemsPerPage: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 1 },
              currentPage: { type: 'number', example: 1 },
            },
          },
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
