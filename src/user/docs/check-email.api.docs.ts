import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CheckEmailDto } from '../dto/check-email.dto';

export function CheckEmailApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Check email availability' }),
    ApiOkResponse({ description: 'Email is available' }),
    ApiConflictResponse({
      description: 'Email has been already taken',
    }),
    ApiBody({ type: CheckEmailDto }),
  );
}
