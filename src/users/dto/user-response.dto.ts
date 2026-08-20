import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserResponseDto implements User {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Aryan Srivastava' })
  name: string;

  @ApiProperty({ example: 'aryan@example.com', format: 'email' })
  email: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
