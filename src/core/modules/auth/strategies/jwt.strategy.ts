import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { HttpCatchException } from '../../../../common/exceptions/http.exception';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private configService: ConfigService,
    private userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }


  async validate(payload: JwtPayload) {
    const user = await this.userService.findUserById(payload.sub)

    if (!user) {
      throw HttpCatchException.unauthorized("User not found")
    }

    if (!user.isActive) {
      throw HttpCatchException.unauthorized("User is not active")
    }
    return user
  }
}