import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';
import * as requestIp from 'request-ip';
import { IExtendedRequest } from '../interfaces/extended-request.interface';

@Injectable()
export class ExtendedRequest implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = requestIp.getClientIp(req);
    const parser = new UAParser(req.headers['user-agent'] as string);
    const result = parser.getResult();

    (req as IExtendedRequest).requestDetails = {
      ip: clientIp || '',
      browser: result.browser.name || '',
      browser_version: result.browser.version || '',
      os: result.os.name || '',
      platform: result.device.model || result.os.name || '',
      is_mobile: result.device.type === 'mobile',
      is_desktop: !result.device.type,
      is_tablet: result.device.type === 'tablet',
    };

    console.log('Request details:', (req as IExtendedRequest).requestDetails);
    next();
  }
}
