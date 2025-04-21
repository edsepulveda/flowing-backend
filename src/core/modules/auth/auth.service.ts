import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AppLogger } from 'src/core/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Users } from '../users/entities/user.entity';
import { verifyPassword } from 'src/common/utils/password.utils';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { HttpCatchException } from 'src/common/exceptions/http.exception';
import { EmailLoginUserDto } from './dto/login.dto';
import { DevicesService } from '../devices/devices.service';
import { IExtendedRequest } from 'src/common/interfaces/extended-request.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Response } from 'express'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
    private readonly devicesService: DevicesService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async register(
    registerDto: RegisterUserDto,
    req: IExtendedRequest,
    res: Response,
  ): Promise<TokenResponseDto> {
    const user = await this.userService.create({
      ...registerDto,
      isActive: true,
      isEmailVerified: true,
    });

    const tokens = await this.generateTokensAndSaveDevice(user, req, res);

    return tokens;
  }

  async validateUser(email: string, password: string): Promise<Users | null> {
    try {
      const user = await this.userService.findOneByEmailWithPassword(email);

      if (!user) {
        return null;
      }

      const isPasswordValid = await verifyPassword(user.password, password);

      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      return null;
    }
  }

  async login(
    loginDto: EmailLoginUserDto,
    req: IExtendedRequest,
    res: Response,
  ): Promise<TokenResponseDto> {
    const user = await this.userService.findOneByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      this.logger.warn(`Failed login attempt for email: ${loginDto.email}`);
      throw HttpCatchException.unauthorized('Invalid credentials');
    }

    const isPasswordValid = await verifyPassword(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${loginDto.email}`);
      throw HttpCatchException.unauthorized('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.warn(`Inactive user attempted to login: ${loginDto.email}`);
      throw HttpCatchException.unauthorized('Invalid credentials');
    }

    const tokens = await this.generateTokensAndSaveDevice(user, req, res);

    await this.userService.update(user.id, { lastLoginAt: new Date() });

    this.logger.debug(`User ${loginDto.email} logged in successfully`);
    return tokens;
  }

  async generateTokensAndSaveDevice(
    user: Users,
    req: IExtendedRequest,
    res: Response,
    existingDeviceId?: string,
  ): Promise<TokenResponseDto> {
    const tokens = await this.generateTokens(user);

    if (!req.cookies.deviceId) {
      res.cookie('deviceId', req.deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    await this.devicesService.saveDeviceInfo(
      user.id,
      req.deviceId,
      tokens.refreshToken,
      req.requestDetails,
      existingDeviceId,
    );

    return tokens;
  }

  async generateTokens(user: Users): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1h'),
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
          '7d',
        ),
      },
    );

    const expiresIn = this.configService.get<number>(
      'JWT_EXPIRATION_SECONDS',
      3600,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
    req: IExtendedRequest,
    res: Response,
  ): Promise<TokenResponseDto> {
    const device = await this.devicesService.validateRefreshToken(
      refreshTokenDto.refreshToken,
    );

    if (!device) {
      throw HttpCatchException.unauthorized('Invalid refresh token');
    }

    const user = await this.userService.findOneById(device.userId);
    if (!user || !user.isActive) {
      throw HttpCatchException.unauthorized('User not found or inactive');
    }

    const tokens = await this.generateTokensAndSaveDevice(user, req, res, device.id);

    return tokens;
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw HttpCatchException.badRequest('Invalid token');
    }
  }

  async getUserFromToken(token: string): Promise<Users> {
    const payload = await this.verifyToken(token);
    return this.userService.findOneById(payload.sub);
  }
}
