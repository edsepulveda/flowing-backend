import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IExtendedRequest } from '../interfaces/extended-request.interface';

@Injectable()
export class Fingerprint implements NestMiddleware {
  private logger = new Logger(Fingerprint.name);
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const existingDeviceId = req.cookies.deviceId;
      this.logger.debug(`Cookie deviceId: ${existingDeviceId || 'not found'}`);

      if (!existingDeviceId || typeof existingDeviceId === 'undefined') {
        const generatedDeviceId = crypto.randomUUID();
        (req as IExtendedRequest).deviceId = generatedDeviceId;
        this.logger.debug(`Generated new deviceId: ${generatedDeviceId}`);
      } else {
        (req as IExtendedRequest).deviceId = existingDeviceId;
        this.logger.debug(`Using existing deviceId: ${existingDeviceId}`);
      }
    } catch (error) {
      this.logger.error('Failed to generate or finding the device id', error);
    }

    next();
  }
}
