import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/core/logger/logger.service';
import { TrustedDeviceRepository } from './repositories/devices.repository';
import { JwtService } from '@nestjs/jwt';
import { RequestDetails } from 'src/common/interfaces/extended-request.interface';
import { TrustedDevice } from './entities/device.entity';
import { HttpCatchException } from 'src/common/exceptions/http.exception';

@Injectable()
export class DevicesService {
  constructor(
    private readonly trustedDeviceRepository: TrustedDeviceRepository,
    private readonly logger: AppLogger,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(DevicesService.name);
  }

  async saveDeviceInfo(
    userId: string,
    deviceId: string,
    refreshToken: string,
    requestDetails: RequestDetails,
    existingDeviceId: string,
  ): Promise<TrustedDevice> {
    try {
      let device: TrustedDevice;

      if (existingDeviceId) {
        device = await this.trustedDeviceRepository.findOneBy({
          id: existingDeviceId,
          userId,
        });

        if (!device) {
          this.logger.warn(
            `Device not found: ${existingDeviceId} for user: ${userId}`,
          );
          return this.createNewDevice(
            userId,
            deviceId,
            refreshToken,
            requestDetails,
          );
        }
      } else {
        device = await this.trustedDeviceRepository.findOneBy({
          userId,
          deviceId,
        });

        if (!device) {
          return this.createNewDevice(
            userId,
            deviceId,
            refreshToken,
            requestDetails,
          );
        }
      }

      return this.updateExistingDevice(device, refreshToken, requestDetails);
    } catch (error) {
      this.logger.error(
        `Error saving device info: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async createNewDevice(
    userId: string,
    deviceId: string,
    refreshToken: string,
    requestDetails?: RequestDetails,
  ): Promise<TrustedDevice> {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const refreshTokenExpiresAt = new Date(decodedToken.exp * 1000);

    return this.trustedDeviceRepository.create({
      userId,
      deviceId,
      refreshToken,
      refreshTokenExpiresAt,
      lastUsedAt: new Date(),
      browser: requestDetails?.browser,
      os: requestDetails?.os,
      ip: requestDetails?.ip,
      isTrusted: true,
    });
  }

  private async updateExistingDevice(
    device: TrustedDevice,
    refreshToken: string,
    requestDetails?: RequestDetails,
  ): Promise<TrustedDevice> {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const refreshTokenExpiresAt = new Date(decodedToken.exp * 1000);

    const updatedDevice = {
      ...device,
      refreshToken,
      refreshTokenExpiresAt,
      lastUsedAt: new Date(),
    };

    if (requestDetails) {
      if (requestDetails.browser)
        updatedDevice.browser = requestDetails.browser;
      if (requestDetails.os) updatedDevice.os = requestDetails.os;
      if (requestDetails.ip) updatedDevice.ip = requestDetails.ip;
    }

    await this.trustedDeviceRepository.update(device.id, updatedDevice);

    return updatedDevice;
  }

  async revokeDevice(userId: string, deviceId: string): Promise<void> {
    try {
      await this.trustedDeviceRepository.updateBy(
        { userId, deviceId },
        {
          isTrusted: false,
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      );
    } catch (error) {
      this.logger.error(`Error revoking device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async revokeAllDevicesExcept(
    userId: string
  ): Promise<void> {

    const currentDevice = await this.getLastUsedDevice(userId)

    return await this.trustedDeviceRepository.shallowRevokeDevices(
      userId,
      currentDevice.id,
    );
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<TrustedDevice | null> {
    try {
      const device = await this.trustedDeviceRepository.findOneBy({
        refreshToken,
      });

      if (!device) {
        this.logger.warn(`Device not found for refresh token`);
        return null;
      }

      if (
        device.refreshTokenExpiresAt &&
        device.refreshTokenExpiresAt < new Date()
      ) {
        this.logger.warn(`Refresh token expired for device: ${device.id}`);
        return null;
      }

      return device;
    } catch (error) {
      this.logger.error(
        `Error validating refresh token: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async getLastUsedDevice(userId: string): Promise<TrustedDevice> {
    try {
      const devices = await this.trustedDeviceRepository.findAll({
        where: { userId },
        order: { lastUsedAt: 'DESC' },
        take: 1,
      });

      if (!devices.length) {
        throw HttpCatchException.notFound('No device found for this user');
      }

      return devices[0];
    } catch (error) {
      this.logger.error(
        `Error finding current device: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async listUserDevices(userId: string): Promise<TrustedDevice[]> {
    try {
      return this.trustedDeviceRepository.listDevicesByUserId(userId);
    } catch (error) {
      this.logger.error(
        `Error listing user devices: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findDeviceById(userId: string, deviceId: string): Promise<TrustedDevice> {
    try {
      const device = await this.trustedDeviceRepository.findOneBy({
        id: deviceId,
        userId
      })

      if (!device) {
        throw HttpCatchException.notFound(`Device for the user ${userId} and Device id ${deviceId} not found`)
      }

      return device
    } catch (error) {
      this.logger.error(
        `Error finding device by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

}
