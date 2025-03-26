import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto';
import { ApiTags } from '@nestjs/swagger';
import { GetAllProjectsFilterDto } from '../dto/get-all-projects.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProjects(@Query() filterDto: GetAllProjectsFilterDto) {
    return this.projectService.findAll(filterDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
