import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrustedDevice } from '../entities/device.entity';
import { BaseRepository } from '../../../database/abstract/repository.abstract';

@Injectable()
export class TrustedDeviceRepository extends BaseRepository<TrustedDevice> {
  constructor(
    @InjectRepository(TrustedDevice)
    private readonly trustedDeviceRepository: Repository<TrustedDevice>,
  ) {
    super(TrustedDevice, trustedDeviceRepository, 'trusted_devices');
  }

  async shallowRevokeDevices(userId: string, deviceId: string) {
    try {
      const queryBuilder = this.trustedDeviceRepository.createQueryBuilder('td');
      
      queryBuilder
        .update()
        .set({ 
          isTrusted: false, 
          refreshToken: null, 
          refreshTokenExpiresAt: null 
        })
        .where('userId = :userId', { userId });

      if (deviceId) {
        queryBuilder.andWhere('deviceId != :deviceId', { deviceId });
      }

      await queryBuilder.execute();
      this.logger.warn(`Closed all the others devices session`)
    } catch (error) {
      throw error;
    }
  }

  async listDevicesByUserId(userId: string): Promise<TrustedDevice[]> {
    try {
      return this.trustedDeviceRepository.find({
        where: { userId },
        select: [
          'id',
          'deviceId',
          'deviceName',
          'browser',
          'os',
          'ip',
          'isTrusted',
          'lastUsedAt',
          'createdAt',
        ],
        order: {
          lastUsedAt: 'DESC',
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
