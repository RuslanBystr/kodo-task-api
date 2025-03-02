import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from '../dto';
import { UserSortByEnum } from '../../user/enums/user-sort.enum';
import { SortOrderEnum } from '../../common/enums/sort-order.enum';
import { generateSearchConditionsUser } from '../../user/utils/search-condition-users';
import { GetAllProjectsFilterDto } from '../dto/get-all-projects.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
  ) {}

  public async create(createProjectDto: CreateProjectDto) {

    const project = this.projectRepo.create({
      ...createProjectDto,
    });

    await this.projectRepo.save(project);
  }

  public async findAll({
    page = 1,
    limit = 10,
    sortBy = UserSortByEnum.CREATED_AT,
    order = SortOrderEnum.ASC,
    ...searchFilterFields
  }: GetAllProjectsFilterDto): Promise<any> {
    const skip = (page - 1) * limit;

    const conditions: FindOptionsWhere<Project> =
      generateSearchConditionsUser<Project>(searchFilterFields);

    const [projectItems, total] = await this.projectRepo.findAndCount({
      select: ['id', 'name', 'description', 'image', 'createdAt'],
      where: conditions,
      relations: ['tasks'],
      skip,
      take: limit,
      order: { [sortBy]: order },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: projectItems,
      meta: {
        totalItems: total,
        itemCount: projectItems.length,
        itemsPerPage: Number(limit),
        totalPages,
        currentPage: Number(page),
      },
    };
  }

  findOne(id: string) {
    return this.projectRepo.findOne({ where: { id }, relations: ['tasks'] });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.projectRepo.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.projectRepo.delete(id);
    return { message: 'Project deleted successfully' };
  }
}
