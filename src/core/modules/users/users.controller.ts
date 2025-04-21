import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  HttpStatus,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { GetUser } from '../auth/decorators/get-user';
import { Users } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HttpCatchException } from 'src/common/exceptions/http.exception';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get Current User' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the current user data',
    type: UserResponseDto,
  })
  async getProfile(@GetUser() user: Users): Promise<UserResponseDto> {
    return user;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns user data',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Current password is incorrect',
  })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() currentUser: Users,
  ) {
    if (currentUser.id !== id) {
      throw HttpCatchException.forbidden(
        'You can only change your own password',
      );
    }

    const result = await this.usersService.changePassword(
      id,
      changePasswordDto,
    );
    return { success: result };
  }

  @Put(':id/enable')
  @ApiOperation({ summary: 'Enable user account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User enabled successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async enableUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.enableUser(id);
  }

  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable user account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User disabled successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async disableUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.disableUser(id);
  }

  @Put(':id/verify-email')
  @ApiOperation({ summary: 'Mark email as verified' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async verifyEmail(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.setEmailVerified(id);
  }
}
