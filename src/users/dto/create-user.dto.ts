import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Aryan Srivastava',
    maxLength: 100,
    description: 'Display name for the user.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'aryan@example.com',
    maxLength: 255,
    format: 'email',
    description: 'Must be unique (case-insensitive).',
  })
  @IsEmail()
  @MaxLength(255)
  email: string;
}
