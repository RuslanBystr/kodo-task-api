import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteThreadApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a thread with its messages' }),
    ApiParam({ name: 'id', type: String, description: 'Thread ID' }),
    ApiNoContentResponse({ description: 'Thread deleted' }),
    ApiForbiddenResponse({ description: 'Thread belongs to another user' }),
    ApiNotFoundResponse({ description: 'Thread not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
