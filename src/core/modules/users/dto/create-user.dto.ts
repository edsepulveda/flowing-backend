import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsBoolean, 
  IsOptional,
  IsEnum 
} from 'class-validator';
import { AccountType } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongP@ssword123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiPropertyOptional({
    description: 'Account type',
    enum: AccountType,
    default: AccountType.Email,
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType = AccountType.Email;

  @ApiPropertyOptional({
    description: 'Is user active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Is email verified',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean = false;

  @ApiPropertyOptional({
    description: 'Is email verified',
    default: false,
  })
  @IsOptional()
  lastLoginAt?: Date
}

