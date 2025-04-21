import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Account type',
    enum: AccountType,
    example: AccountType.Email,
  })
  accountType: AccountType;

  @ApiProperty({
    description: 'Is user active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Is email verified',
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Date of last login',
    example: '2023-01-01T00:00:00Z',
  })
  lastLoginAt: Date;

  @ApiProperty({
    description: 'Date of creation',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date of last update',
    example: '2023-01-01T00:00:00Z',
  })
  updatedAt: Date;
}