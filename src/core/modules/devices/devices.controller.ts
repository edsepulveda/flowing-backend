import { Controller, Delete, Get, HttpStatus, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user';
import { Users } from '../users/entities/user.entity';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user devices' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a list of all devices for the authenticated user',
  })
  async findAllUserDevices(@GetUser() user: Users) {
    return this.devicesService.listUserDevices(user.id);
  }

  @Get('last')
  @ApiOperation({ summary: 'Get last device info' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns information about the last device',
  })
  async getLastUsed(@GetUser() user: Users) {
    return this.devicesService.getLastUsedDevice(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a single device by ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Device not found',
  })
  async findDeviceById(@GetUser() user: Users, @Param('id') id: string) {
    return this.devicesService.findDeviceById(user.id, id);
  }


  @Delete()
  @ApiOperation({ summary: 'Revoke all other device sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All other device sessions revoked successfully',
  })
  async revokeAllOtherDevices(@GetUser() user: Users) {
    await this.devicesService.revokeAllDevicesExcept(user.id);
    return { message: 'All other device sessions revoked successfully' };
  }  

}
