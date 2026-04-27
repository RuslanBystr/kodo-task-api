import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export const ApiCreateWorkspace = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create workspace' }),
    ApiOkResponse({ description: 'Workspace created' }),
  );
};
