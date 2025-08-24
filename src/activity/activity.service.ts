import { Injectable, NotFoundException } from '@nestjs/common';
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
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const logs = await this.taskRepo
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

      return logs;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
