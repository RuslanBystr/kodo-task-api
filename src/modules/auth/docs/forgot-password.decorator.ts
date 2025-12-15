import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ForgotPasswordEmailDto } from '../dto';
import { ForgotPasswordResponseDto } from '../dto/responses';

export function ForgotPasswordApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Send forgot password email to user.' }),
    ApiNotFoundResponse({
      description: 'User not found.',
    }),
    ApiOkResponse({
      type: ForgotPasswordResponseDto,
    }),
    ApiBody({
      type: ForgotPasswordEmailDto,
    }),
  );
}
