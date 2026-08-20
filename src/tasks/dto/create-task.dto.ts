import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../task.enums';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Write Swagger docs',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'Document every endpoint, DTO, and response code.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    enumName: 'TaskStatus',
    default: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
    enumName: 'TaskPriority',
    default: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-09-01T17:00:00.000Z',
    description: 'ISO 8601 date-time string.',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    format: 'uuid',
    example: '55a0218e-376e-46d2-8fa7-d314ec77c866',
    description:
      'Owning user id. Must reference an existing user. Temporary until authentication exists.',
  })
  @IsUUID()
  userId: string;
}
