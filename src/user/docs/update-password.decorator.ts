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
import { ChangePasswordResponseDto } from '../dto/responses/change-password-response.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';

export function UpdatePasswordApiDocs() {
  return applyDecorators(
    ApiBearerAuth('Access-token'),
    ApiOperation({ summary: 'Change password' }),
    ApiBadRequestResponse({
      description: 'Invalid password',
    }),
    ApiNotFoundResponse({
      description: 'User not found.',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Your account was blocked' }),
    ApiOkResponse({
      type: ChangePasswordResponseDto,
    }),
    ApiBody({
      type: UpdatePasswordDto,
    }),
  );
}
