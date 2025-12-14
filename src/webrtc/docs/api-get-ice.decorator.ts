import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IceConfigDto } from '../dto/ice-config.dto';
import { IceServerDto } from '../dto/ice-server.dto';

export function ApiGetIce() {
  return applyDecorators(
    ApiExtraModels(IceConfigDto, IceServerDto),
    ApiOperation({
      summary: 'Get ice servers',
      description: 'Returns TURN/STUN servers and credentials',
    }),
    ApiBearerAuth(),
    ApiOkResponse({ type: IceConfigDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
