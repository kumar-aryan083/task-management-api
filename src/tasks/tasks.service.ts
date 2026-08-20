import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTaskDto } from './dto/create-task.dto';
import { SortOrder, TaskQueryDto, TaskSortBy } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriority } from './task-priority.enum';
import { TaskStatus } from './task-status.enum';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskListResponse {
  items: Task[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  create(dto: CreateTaskDto): Task {
    const now = new Date();
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.TODO,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      userId: dto.userId,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  findAll(query: TaskQueryDto = {}): TaskListResponse {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? TaskSortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;
    const search = query.search?.trim().toLowerCase();

    const filteredTasks = this.tasks.filter((task) => {
      const matchesStatus = query.status ? task.status === query.status : true;
      const matchesPriority = query.priority
        ? task.priority === query.priority
        : true;
      const matchesSearch = search
        ? task.title.toLowerCase().includes(search)
        : true;

      return matchesStatus && matchesPriority && matchesSearch;
    });

    const sortedTasks = [...filteredTasks].sort((firstTask, secondTask) =>
      this.compareTasks(firstTask, secondTask, sortBy, sortOrder),
    );
    const total = sortedTasks.length;
    const startIndex = (page - 1) * limit;
    const items = sortedTasks.slice(startIndex, startIndex + limit);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    Object.assign(task, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : task.dueDate,
      updatedAt: new Date(),
    });
    return task;
  }

  remove(id: string): void {
    const task = this.findOne(id);
    this.tasks = this.tasks.filter((t) => t.id !== task.id);
  }

  private compareTasks(
    firstTask: Task,
    secondTask: Task,
    sortBy: TaskSortBy,
    sortOrder: SortOrder,
  ): number {
    const direction = sortOrder === SortOrder.ASC ? 1 : -1;
    const firstValue = this.getSortableValue(firstTask, sortBy);
    const secondValue = this.getSortableValue(secondTask, sortBy);

    if (firstValue === secondValue) {
      return 0;
    }

    if (firstValue === null) {
      return 1;
    }

    if (secondValue === null) {
      return -1;
    }

    return firstValue > secondValue ? direction : -direction;
  }

  private getSortableValue(
    task: Task,
    sortBy: TaskSortBy,
  ): string | number | null {
    const value = task[sortBy];

    if (value instanceof Date) {
      return value.getTime();
    }

    return value;
  }
}
