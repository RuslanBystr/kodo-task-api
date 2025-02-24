import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ResetPasswordResponseDto } from '../dto/responses/reset-password-response.dto';

export function ResetPasswordApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Reset password' }),
    ApiOkResponse({
      description: 'Success',
      type: ResetPasswordResponseDto,
    }),
    ApiBadRequestResponse({
      schema: {
        anyOf: [
          {
            example: 'Invalid code',
          },
          {
            example: 'Verification time expired',
          },
        ],
      },
    }),
    ApiBody({
      type: ResetPasswordDto,
    }),
  );
}
