export { TaskStatus, TaskPriority } from '@prisma/client';

export enum TaskSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DUE_DATE = 'dueDate',
  TITLE = 'title',
  STATUS = 'status',
  PRIORITY = 'priority',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
