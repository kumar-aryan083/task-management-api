import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SortOrder, TaskSortBy } from './dto/task-query.dto';
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

    const result = service.findAll();

    expect(result.items).toHaveLength(2);
    expect(result.items).toContain(firstTask);
    expect(result.items).toContain(secondTask);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it('filters tasks by status and priority', () => {
    service.create({
      title: 'Low priority todo',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      userId,
    });
    const matchingTask = service.create({
      title: 'High priority done',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      userId,
    });

    expect(
      service.findAll({
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
      }),
    ).toEqual({
      items: [matchingTask],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it('searches tasks by title', () => {
    const matchingTask = service.create({
      title: 'Learn NestJS pipes',
      userId,
    });
    service.create({
      title: 'Write Docker notes',
      userId,
    });

    expect(
      service.findAll({
        search: 'nestjs',
      }),
    ).toEqual({
      items: [matchingTask],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it('sorts tasks', () => {
    const firstTask = service.create({
      title: 'B task',
      userId,
    });
    const secondTask = service.create({
      title: 'A task',
      userId,
    });

    expect(
      service.findAll({
        sortBy: TaskSortBy.TITLE,
        sortOrder: SortOrder.ASC,
      }).items,
    ).toEqual([secondTask, firstTask]);
  });

  it('paginates tasks', () => {
    service.create({
      title: 'First task',
      userId,
    });
    const secondTask = service.create({
      title: 'Second task',
      userId,
    });
    service.create({
      title: 'Third task',
      userId,
    });

    expect(
      service.findAll({
        page: 2,
        limit: 1,
        sortBy: TaskSortBy.TITLE,
        sortOrder: SortOrder.ASC,
      }),
    ).toEqual({
      items: [secondTask],
      page: 2,
      limit: 1,
      total: 3,
      totalPages: 3,
    });
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

  it('marks a task as completed', () => {
    const task = service.create({
      title: 'Complete this task',
      status: TaskStatus.IN_PROGRESS,
      userId,
    });
    const originalUpdatedAt = task.updatedAt;

    const completedTask = service.complete(task.id);

    expect(completedTask).toBe(task);
    expect(completedTask.status).toBe(TaskStatus.DONE);
    expect(completedTask.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime(),
    );
  });

  it('throws when completing a missing task', () => {
    expect(() =>
      service.complete('7354d194-9a22-4865-8128-cc0fb0b33267'),
    ).toThrow(NotFoundException);
  });

  it('deletes a task', () => {
    const task = service.create({
      title: 'Delete this task',
      userId,
    });

    service.remove(task.id);

    expect(service.findAll().items).toEqual([]);
  });

  it('throws when deleting a missing task', () => {
    expect(() =>
      service.remove('7354d194-9a22-4865-8128-cc0fb0b33267'),
    ).toThrow(NotFoundException);
  });
});
