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
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { TaskService } from '../services/task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  GetAllTasksFilterDto,
  SetTimeDto,
} from '../dto';

@ApiTags('task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateTaskDto) {
    return this.taskService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTasks(@Query() filterDto: GetAllTasksFilterDto) {
    return this.taskService.findAll(filterDto);
  }

  @Put('/spend/:id')
  @UseGuards(JwtAuthGuard)
  async trackTaskTime(@Param('id') id: string, @Body() setTimeDto: SetTimeDto) {
    return await this.taskService.updateTaskTime(id, setTimeDto);
  }

  @Delete('/logs/:id')
  @UseGuards(JwtAuthGuard)
  removeLog(@Param('id') id: string) {
    return this.taskService.removeLog(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
