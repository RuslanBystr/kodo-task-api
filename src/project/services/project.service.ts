import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { User } from '../../user/entities/user.entity';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  GetAllProjectsFilterDto,
  RemoveProjectMemberDto,
  UpdateProjectDto,
} from '../dto';
import { UserSortByEnum } from '../../user/enums';
import { SortOrderEnum } from '../../common/enums';
import { generateSearchConditions } from '../../common/utils';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  public async create(createProjectDto: CreateProjectDto, userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const project = this.projectRepo.create({
      ...createProjectDto,
      members: [user],
    });

    await this.projectRepo.save(project);
    return project;
  }

  public async findAll(
    {
      page = 1,
      limit = 10,
      sortBy = UserSortByEnum.CREATED_AT,
      order = SortOrderEnum.ASC,
      ...searchFilterFields
    }: GetAllProjectsFilterDto,
    userId: number,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const conditions: FindOptionsWhere<Project> =
      generateSearchConditions<Project>(searchFilterFields);

    const [projectItems] = await this.projectRepo.findAndCount({
      select: ['id', 'name', 'description', 'image', 'createdAt'],
      where: conditions,
      relations: ['tasks', 'members'],
      skip,
      take: limit,
      order: { [sortBy]: order },
    });

    const filteredProjects = projectItems.filter((project) =>
      project.members.some((member) => member.id === userId),
    );

    const filteredTotal = filteredProjects.length;
    const totalPages = Math.ceil(filteredTotal / limit);

    return {
      items: filteredProjects,
      meta: {
        totalItems: filteredTotal,
        itemCount: filteredProjects.length,
        itemsPerPage: Number(limit),
        totalPages,
        currentPage: Number(page),
      },
    };
  }

  findOne(id: string) {
    return this.projectRepo.findOne({
      where: { id },
      relations: ['tasks', 'members'],
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.projectRepo.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.projectRepo.delete(id);
    return { message: 'Project deleted successfully' };
  }

  async addMember(
    projectId: string,
    dto: AddProjectMemberDto,
    currentUserId: number,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (!(await this.isUserMember(projectId, currentUserId))) {
      throw new ForbiddenException(
        'You do not have permission to add members to this project',
      );
    }

    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Check if user is already a member
    if (project.members.some((member) => member.id === dto.userId)) {
      return { message: 'User is already a member of this project' };
    }

    project.members.push(user);
    await this.projectRepo.save(project);

    return { message: 'User added to project successfully' };
  }

  async removeMember(
    projectId: string,
    dto: RemoveProjectMemberDto,
    currentUserId: number,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if current user is a member of the project
    if (!(await this.isUserMember(projectId, currentUserId))) {
      throw new ForbiddenException(
        'You do not have permission to remove members from this project',
      );
    }

    const userIndex = project.members.findIndex(
      (member) => member.id === dto.userId,
    );
    if (userIndex === -1) {
      return { message: 'User is not a member of this project' };
    }

    project.members.splice(userIndex, 1);
    await this.projectRepo.save(project);

    return { message: 'User removed from project successfully' };
  }

  async getMembers(projectId: string, currentUserId: number) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if current user is a member of the project
    if (!(await this.isUserMember(projectId, currentUserId))) {
      throw new ForbiddenException(
        'You do not have permission to view members of this project',
      );
    }

    return project.members;
  }

  async isUserMember(projectId: string, userId: number): Promise<boolean> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members'],
    });

    if (!project) {
      return false;
    }

    return project.members.some((member) => member.id === userId);
  }
}
