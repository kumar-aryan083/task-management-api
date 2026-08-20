import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Task with id ... not found' })
  message: string;

  @ApiProperty({ example: 'Not Found', required: false })
  error?: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    type: [String],
    example: ['email must be an email'],
    description:
      'class-validator produces one message per failed field; ParseUUIDPipe failures return a single string instead.',
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
