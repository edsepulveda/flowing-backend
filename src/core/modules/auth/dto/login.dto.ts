import { IsEmail, IsNotEmpty, IsString, MinLength, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailLoginUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
