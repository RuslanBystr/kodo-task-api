import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './interface/controllers/members.controller';
import { GetAllMembersHandler } from './application/queries';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/infrastructure/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project]), CqrsModule],
  controllers: [MembersController],
  providers: [GetAllMembersHandler],
})
export class MembersModule {}
