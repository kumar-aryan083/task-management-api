import { ApiProperty } from '@nestjs/swagger';
import { Task } from '@prisma/client';
import { TaskPriority, TaskStatus } from '../task.enums';

export class TaskResponseDto implements Task {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Write Swagger docs' })
  title: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ enum: TaskStatus, enumName: 'TaskStatus' })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, enumName: 'TaskPriority' })
  priority: TaskPriority;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  dueDate: Date | null;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
