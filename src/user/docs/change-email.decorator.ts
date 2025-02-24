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
import { UpdateEmailDto } from '../dto/update-email.dto';
import { ChangeEmailResponseDto } from '../dto/responses/change-email-response.dto';

export function ChangeEmailApiDocs() {
  return applyDecorators(
    ApiBearerAuth('Access-token'),
    ApiOperation({ summary: 'Change email' }),
    ApiOkResponse({
      type: ChangeEmailResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Your account was blocked' }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiBadRequestResponse({
      description: 'User with such email already exist',
    }),
    ApiBody({
      type: UpdateEmailDto,
    }),
  );
}
