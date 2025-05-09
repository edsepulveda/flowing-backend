import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsOptional, IsPositive } from 'class-validator';

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsJWT()
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for getting a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsJWT()
  refreshToken?: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  @IsPositive()
  expiresIn: number;

  @ApiProperty({
    description: "Refresh Token expiration time",
    example: 4000
  })
  refreshExpiresIn: number;

  @ApiProperty({
    description: 'Token type (always Bearer)',
    example: 'Bearer',
  })
  tokenType: string;
}