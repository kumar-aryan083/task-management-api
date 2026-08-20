import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskPriority } from './task-priority.enum';
import { TaskStatus } from './task-status.enum';

describe('TasksService', () => {
  let service: TasksService;
  const userId = '55a0218e-376e-46d2-8fa7-d314ec77c866';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a task with defaults', () => {
    const task = service.create({
      title: 'Learn NestJS modules',
      userId,
    });

    expect(typeof task.id).toBe('string');
    expect(task.title).toBe('Learn NestJS modules');
    expect(task.description).toBeNull();
    expect(task.status).toBe(TaskStatus.TODO);
    expect(task.priority).toBe(TaskPriority.MEDIUM);
    expect(task.dueDate).toBeNull();
    expect(task.userId).toBe(userId);
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
  });

  it('creates a task with optional fields', () => {
    const task = service.create({
      title: 'Write DTO tests',
      description: 'Cover validation later at the API boundary.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: '2026-09-01T10:00:00.000Z',
      userId,
    });

    expect(task.description).toBe(
      'Cover validation later at the API boundary.',
    );
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.dueDate).toEqual(new Date('2026-09-01T10:00:00.000Z'));
  });

  it('finds all tasks', () => {
    const firstTask = service.create({
      title: 'First task',
      userId,
    });
    const secondTask = service.create({
      title: 'Second task',
      userId,
    });

    expect(service.findAll()).toEqual([firstTask, secondTask]);
  });

  it('finds one task by id', () => {
    const task = service.create({
      title: 'Find this task',
      userId,
    });

    expect(service.findOne(task.id)).toBe(task);
  });

  it('throws when finding a missing task', () => {
    expect(() =>
      service.findOne('7354d194-9a22-4865-8128-cc0fb0b33267'),
    ).toThrow(NotFoundException);
  });

  it('updates a task', () => {
    const task = service.create({
      title: 'Old title',
      status: TaskStatus.TODO,
      userId,
    });
    const originalUpdatedAt = task.updatedAt;

    const updatedTask = service.update(task.id, {
      title: 'New title',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
    });

    expect(updatedTask).toBe(task);
    expect(updatedTask.title).toBe('New title');
    expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS);
    expect(updatedTask.priority).toBe(TaskPriority.LOW);
    expect(updatedTask.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime(),
    );
  });

  it('keeps the existing due date when update dto does not include one', () => {
    const task = service.create({
      title: 'Task with due date',
      dueDate: '2026-09-01T10:00:00.000Z',
      userId,
    });

    const updatedTask = service.update(task.id, {
      title: 'Still has due date',
    });

    expect(updatedTask.dueDate).toEqual(new Date('2026-09-01T10:00:00.000Z'));
  });

  it('deletes a task', () => {
    const task = service.create({
      title: 'Delete this task',
      userId,
    });

    service.remove(task.id);

    expect(service.findAll()).toEqual([]);
  });

  it('throws when deleting a missing task', () => {
    expect(() =>
      service.remove('7354d194-9a22-4865-8128-cc0fb0b33267'),
    ).toThrow(NotFoundException);
  });
});
