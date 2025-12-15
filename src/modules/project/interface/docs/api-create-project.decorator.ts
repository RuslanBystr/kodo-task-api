import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateProjectDto } from '../dto';

export function ApiCreateProject() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new project',
      description: 'Creates a new project for the authenticated user.',
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateProjectDto,
      required: true,
      examples: {
        default: {
          summary: 'Example payload',
          value: {
            name: 'AI Assistant Platform',
            description: 'Platform for managing AI prompts and agents',
            image: '550e8400-e29b-41d4-a716-446655440000',
            members: [
              'a1e5b713-2a97-4b5b-8dc7-11e3e8b23b44',
              'b7b23e58-8dc1-46af-b0d9-91af03a51c0c',
            ],
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Project successfully created',
      schema: {
        example: {
          id: 42,
          name: 'AI Assistant Platform',
          description: 'Platform for managing AI prompts and agents',
          image: '550e8400-e29b-41d4-a716-446655440000',
          owner: {
            id: 7,
            email: 'user@example.com',
          },
          members: [
            { id: 7, email: 'user@example.com' },
            { id: 9, email: 'teammate@example.com' },
          ],
          createdAt: '2025-11-01T08:00:00.000Z',
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Validation error / Bad request' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
