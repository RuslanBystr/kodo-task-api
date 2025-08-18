import { CanActivate } from '@nestjs/common';

export class TaskOwnerGuard implements CanActivate {
  canActivate() {
    return true;
  }
}