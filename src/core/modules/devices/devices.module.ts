import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrustedDevice } from './entities/device.entity';
import { TrustedDeviceRepository } from './repositories/devices.repository';
import { AppLogger } from 'src/core/logger/logger.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([TrustedDevice])],
  controllers: [DevicesController],
  providers: [DevicesService, TrustedDeviceRepository, AppLogger, JwtService],
})
export class DevicesModule {}
