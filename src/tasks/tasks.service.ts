import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTaskDto } from './dto/create-task.dto';
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

  findAll(): Task[] {
    return this.tasks;
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
}
