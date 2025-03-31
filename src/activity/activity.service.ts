import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../project/entities/task.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
  ) {}
  async userActivity(activityDto: ActivityDto) {
    try {
      const userId = activityDto.userId;
      const user =  await this.userRepo.findOne({where: {id: userId}});
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const logs = await this.taskRepo
        .createQueryBuilder('task')
        .leftJoin('task.assignedUser', 'user')
        .leftJoin('task.timeLogger', 'log')
        .where('user.id = :userId', { userId })
        .select(['DATE(log.loggedAt) AS date', 'SUM(log.duration) AS totalTime'])
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
