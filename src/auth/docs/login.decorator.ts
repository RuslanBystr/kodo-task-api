import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { LoginDto } from '../../common/dto/login.dto';
import { LoginResponseDto } from '../dto/responses/login-response.dto';

export function LoginApiDocs() {
  return applyDecorators(
    //ApiBearerAuth('Access-token'),
    ApiOperation({ summary: 'Login' }),
    ApiOkResponse({
      type: LoginResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid credentials',
    }),
    ApiBody({
      type: LoginDto,
    }),
  );
}
