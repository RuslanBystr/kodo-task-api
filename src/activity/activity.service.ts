import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from '../project/infrastructure/entities/task.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
  ) {}
  async userActivity(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    try {
      return await this.taskRepo
        .createQueryBuilder('task')
        .leftJoin('task.assignedUser', 'user')
        .leftJoin('task.timeLogger', 'log')
        .where('user.id = :userId', { userId })
        .select([
          'DATE(log.loggedAt) AS date',
          'SUM(log.duration) AS totalTime',
        ])
        .groupBy('DATE(log.loggedAt)')
        .orderBy('DATE(log.loggedAt)', 'ASC')
        .getRawMany();
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
