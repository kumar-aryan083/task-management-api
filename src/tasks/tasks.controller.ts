import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Task } from '@prisma/client';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import { TasksService } from './tasks.service';
import type { TaskListResponse } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { TaskListResponseDto } from './dto/task-list-response.dto';
import { TaskResponseDto } from './dto/task-response.dto';

const TASK_ID_PARAM = {
  name: 'id',
  format: 'uuid' as const,
  description: 'Task id',
};

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiCreatedResponse({ type: TaskResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid or missing fields.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The referenced userId does not exist.',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List tasks with pagination, filtering, search and sorting',
  })
  @ApiOkResponse({ type: TaskListResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
    type: ValidationErrorResponseDto,
  })
  findAll(@Query() query: TaskQueryDto): Promise<TaskListResponse> {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one task' })
  @ApiParam(TASK_ID_PARAM)
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiBadRequestResponse({
    description: 'Malformed task id.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark a task as completed (sets status to DONE)' })
  @ApiParam(TASK_ID_PARAM)
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiBadRequestResponse({
    description: 'Malformed task id.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  complete(@Param('id', ParseUUIDPipe) id: string): Promise<Task> {
    return this.tasksService.complete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam(TASK_ID_PARAM)
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid fields or malformed task id.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam(TASK_ID_PARAM)
  @ApiOkResponse({ description: 'Deleted. Empty body.' })
  @ApiBadRequestResponse({
    description: 'Malformed task id.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tasksService.remove(id);
  }
}
