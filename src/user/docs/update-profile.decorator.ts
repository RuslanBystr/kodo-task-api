import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateUserResponseDto } from '../dto/responses/update-user-response.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export function UpdateProfileApiDocs() {
  return applyDecorators(
    ApiBearerAuth('Access-token'),
    ApiOperation({ summary: 'Update profile data' }),
    ApiOkResponse({
      description: 'Profile data',
      type: UpdateUserResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'User not found.',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Your account was blocked' }),
    ApiBadRequestResponse({
      description: 'User with such email already exist',
    }),
    ApiBody({
      type: UpdateUserDto,
    }),
  );
}
