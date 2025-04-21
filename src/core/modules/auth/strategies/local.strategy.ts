import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { HttpCatchException } from '../../../../common/exceptions/http.exception';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password)

    if (!user) {
      throw HttpCatchException.unauthorized("Invalid Credentials")
    }

    if (!user.isActive) {
      throw HttpCatchException.unauthorized("User is not active")
    }
    return user
  }


}