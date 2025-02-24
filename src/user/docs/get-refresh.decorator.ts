import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetRefreshDto } from '../dto/responses/get-refresh.dto';

export function GetRefreshApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get new access token' }),
    ApiNotFoundResponse({
      description: 'User not found.',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiOkResponse({
      type: GetRefreshDto,
    }),
  );
}
