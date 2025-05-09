import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public-route';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenResponseDto } from './dto/token-response.dto';
import { RegisterUserDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailLoginUserDto } from './dto/login.dto';
import { IExtendedRequest } from 'src/common/interfaces/extended-request.interface';
import { JwtRefreshGuard } from './guards/refresh-token.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async register(
    @Body() registerDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    return this.authService.register(registerDto, res);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(
    @Body() loginDto: EmailLoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    return this.authService.login(loginDto, res);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refreshToken(
    @Req() req: IExtendedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    return this.authService.refreshToken(req, res);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    await this.authService.logout(res);
    return { success: true };
  }

  @Get('validate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token is valid' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token is invalid',
  })
  async validateToken(): Promise<{ valid: boolean }> {
    return { valid: true };
  }
}
