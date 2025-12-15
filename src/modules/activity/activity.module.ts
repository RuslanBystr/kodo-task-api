import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '../project/infrastructure/entities/task.entity';
import { User } from '../user/entities/user.entity';
import { ActivityController } from './activity.controller';
import { ActivityResolver } from './activity.resolver';
import { ActivityService } from './activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User])],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityResolver],
})
export class ActivityModule {}
