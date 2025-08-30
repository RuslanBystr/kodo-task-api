import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../../types';

export const GetJwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return user;
  },
);
