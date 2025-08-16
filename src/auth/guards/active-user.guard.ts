import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthRequest } from '../../common/types';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';

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
