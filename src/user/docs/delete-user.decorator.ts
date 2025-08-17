// delete-user.docs.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteUserDocs() {
  return applyDecorators(
    ApiBearerAuth('Access-token'),
    ApiOperation({ summary: 'Delete user by id' }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'User ID',
      example: 123,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({
      description: 'Requires admin role or account is blocked',
    }),
    ApiNotFoundResponse({ description: 'User not found' }),
    ApiNoContentResponse({ description: 'User deleted' }),
  );
}
