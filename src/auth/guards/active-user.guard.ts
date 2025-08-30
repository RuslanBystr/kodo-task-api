import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthRequest } from '../../common/types';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest<AuthRequest>();
    if (!user) return false;
    const userInDb = await this.userRepository.findOne({
      where: { id: user.id, deletedAt: null, status: true, isBlocked: false },
    });
    if (userInDb) {
      return true;
    } else {
      throw new ForbiddenException('Your account was blocked');
    }
  }
}
