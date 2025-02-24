import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UploadFileDto } from '../dto/upload-file.dto';
import { UploadFileResponseDto } from '../dto/responses/upload-file-response.dto';

export function UploadFileApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload avatar' }),
    ApiBearerAuth('Access-token'),
    ApiBody({ type: UploadFileDto }),
    ApiBadRequestResponse({ description: 'File already exists' }),
    ApiOkResponse({ type: UploadFileResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({
      description: 'Your account was blocked',
    }),
  );
}
