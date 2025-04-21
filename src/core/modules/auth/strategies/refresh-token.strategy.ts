import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { HttpCatchException } from 'src/common/exceptions/http.exception';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload & { type?: string }) {
    if (payload.type !== 'refresh') {
      throw HttpCatchException.unauthorized('Invalid token type');
    }

    const user = await this.userService.findOneById(payload.sub);

    if (!user) {
      throw HttpCatchException.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw HttpCatchException.unauthorized('User is not active');
    }
    const refreshToken = req.body.refreshToken;
    return { ...user, refreshToken };
  }
}
