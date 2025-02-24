import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ChangePhoneResponseDto } from '../dto/responses/change-phone-response.dto';
import { UpdatePhoneDto } from '../dto/update-phone.dto';
export function ChangePhoneApiDocs() {
  return applyDecorators(
    ApiBearerAuth('Access-token'),
    ApiOperation({ summary: 'Change phone' }),
    ApiOkResponse({
      type: ChangePhoneResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Your account was blocked' }),
    ApiBody({
      type: UpdatePhoneDto,
    }),
  );
}
