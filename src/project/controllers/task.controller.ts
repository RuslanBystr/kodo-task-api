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
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { TaskService } from '../services/task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  GetAllTasksFilterDto,
  SetTimeDto,
} from '../dto';
import { AuthRequest } from '../../common/types';

@ApiBearerAuth('access_token')
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
  async getTasks(
    @Query() filterDto: GetAllTasksFilterDto,
    @Req() req: AuthRequest,
  ) {
    return this.taskService.findAll(req.user.id, filterDto);
  }

  @Put('/spend/:id')
  @UseGuards(JwtAuthGuard)
  async trackTaskTime(
    @Param('id') taskId: string,
    @Body() setTimeDto: SetTimeDto,
    @Req() req: AuthRequest,
  ) {
    return await this.taskService.updateTaskTime(
      req.user.id,
      taskId,
      setTimeDto,
    );
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
