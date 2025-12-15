import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../user/entities/user.entity';
import { Project } from '../../infrastructure/entities/project.entity';
import { AddProjectMemberCommand } from './add-project-member.command';

@CommandHandler(AddProjectMemberCommand)
export class AddProjectMemberHandler
  implements ICommandHandler<AddProjectMemberCommand>
{
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private async isUserMember(projectId: string, userId: number) {
    const count = await this.projectRepo
      .createQueryBuilder('p')
      .innerJoin('p.members', 'm', 'm.id = :userId', { userId })
      .where('p.id = :projectId', { projectId })
      .getCount();
    return count > 0;
  }

  async execute(c: AddProjectMemberCommand) {
    const project = await this.projectRepo.findOne({
      where: { id: c.projectId },
      relations: ['members'],
    });
    if (!project)
      throw new NotFoundException(`Project with ID ${c.projectId} not found`);

    if (!(await this.isUserMember(c.projectId, c.currentUserId))) {
      throw new ForbiddenException(
        'You do not have permission to add members to this project',
      );
    }

    const user = await this.userRepo.findOne({ where: { email: c.dto.email } });
    if (!user)
      throw new NotFoundException(`User with ID ${c.dto.email} not found`);

    if (project.members.some((m) => m.email === c.dto.email)) {
      return { message: 'User is already a member of this project' };
    }

    project.members.push(user);
    await this.projectRepo.save(project);

    return { message: 'User added to project successfully' };
  }
}
