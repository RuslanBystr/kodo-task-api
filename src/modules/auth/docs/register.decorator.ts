import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { RegisterDto } from '../dto';
import { RegisterResponseDto } from '../dto/responses';

export function RegisterApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Register' }),
    ApiOkResponse({
      type: RegisterResponseDto,
    }),
    ApiConflictResponse({
      description: 'This email is already taken',
    }),
    ApiBody({
      type: RegisterDto,
    }),
  );
}
