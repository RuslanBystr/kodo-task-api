import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function GetFileApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get file' }),
    ApiBadRequestResponse({ description: 'File not found' }),
    ApiOkResponse(),
  );
}
