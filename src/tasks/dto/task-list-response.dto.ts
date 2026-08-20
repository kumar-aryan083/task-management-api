import { ApiProperty } from '@nestjs/swagger';
import { TaskListResponse } from '../tasks.service';
import { TaskResponseDto } from './task-response.dto';

export class TaskListResponseDto implements TaskListResponse {
  @ApiProperty({ type: [TaskResponseDto] })
  items: TaskResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
