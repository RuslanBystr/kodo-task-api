import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RemoveFileResponseDto } from '../dto/responses/remove-file-response.dto';

export function DeleteFileApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete file' }),
    ApiBearerAuth('Access-token'),
    ApiBadRequestResponse({ description: 'File not found' }),
    ApiOkResponse({ type: RemoveFileResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({
      description: 'Your account was blocked',
    }),
  );
}
