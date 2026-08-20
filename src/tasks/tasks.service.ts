import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SortOrder, TaskPriority, TaskSortBy, TaskStatus } from './task.enums';

export interface TaskListResponse {
  items: Task[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const FOREIGN_KEY_VIOLATION = 'P2003';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    try {
      const task = await this.prisma.task.create({
        data: {
          title: dto.title,
          description: dto.description ?? null,
          status: dto.status ?? TaskStatus.TODO,
          priority: dto.priority ?? TaskPriority.MEDIUM,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          userId: dto.userId,
        },
      });
      this.logger.log(`Created task id=${task.id} userId=${task.userId}`);

      return task;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === FOREIGN_KEY_VIOLATION
      ) {
        this.logger.warn(
          `Rejected task creation for missing userId=${dto.userId}`,
        );
        throw new NotFoundException(`User with id ${dto.userId} not found`);
      }

      throw error;
    }
  }

  async findAll(query: TaskQueryDto = {}): Promise<TaskListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? TaskSortBy.CREATED_AT;
    const sortOrder = (query.sortOrder ?? SortOrder.DESC) as Prisma.SortOrder;
    const search = query.search?.trim();

    const where: Prisma.TaskWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);
    this.logger.log(`Listed tasks page=${page} limit=${limit} total=${total}`);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      this.logger.warn(`Task not found id=${id}`);
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id);

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
    this.logger.log(`Updated task id=${id}`);

    return updated;
  }

  async complete(id: string): Promise<Task> {
    await this.findOne(id);

    const completed = await this.prisma.task.update({
      where: { id },
      data: { status: TaskStatus.DONE },
    });
    this.logger.log(`Completed task id=${id}`);

    return completed;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    this.logger.log(`Deleted task id=${id}`);
  }
}
