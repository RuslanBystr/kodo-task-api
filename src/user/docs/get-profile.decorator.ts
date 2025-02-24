import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUserResponseDto } from '../dto/responses/get-user-response.dto';

export function GetProfileApiDocs() {
  return applyDecorators(
    ApiBearerAuth('Access-token'),
    ApiOperation({ summary: 'Get profile data' }),
    ApiNotFoundResponse({
      description: 'User not found.',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Your account was blocked' }),
    ApiOkResponse({
      type: GetUserResponseDto,
    }),
  );
}
