import { Injectable } from '@nestjs/common';

import { ActionEnum, PolicyContextMap } from './access.types';

/**
 * Evaluates access for a specific action using a typed context
 * that includes user, resource, and related state.
 */
@Injectable()
export class AccessService {
  can<T extends ActionEnum>(action: T, ctx: PolicyContextMap[T]): boolean {
    switch (action) {
      case ActionEnum.CREATE_WORKSPACE:
        ctx.userId;
        return true;

      default:
        throw new Error('Action not found');
    }
  }
}
