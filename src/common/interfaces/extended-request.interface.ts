import type { UUID } from 'crypto';
import type { Request } from 'express';
import type { Users } from 'src/core/modules/users/entities/user.entity';

export interface RequestDetails {
  ip: string;
  browser: string;
  browser_version: string;
  os: string;
  platform: string;
  is_mobile: boolean;
  is_desktop: boolean;
  is_tablet: boolean;
}

export interface IExtendedRequest extends Request {
  requestDetails?: RequestDetails;
  deviceId?: UUID;
  user?: Users;
}
