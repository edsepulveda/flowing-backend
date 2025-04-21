import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ExtendedRequest } from 'src/common/middlewares/extended-request.middleware';
import { Fingerprint } from 'src/common/middlewares/fingerprint.middleware';
import { JwtRefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { DevicesService } from '../devices/devices.service';
import { TrustedDeviceRepository } from '../devices/repositories/devices.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrustedDevice } from '../devices/entities/device.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrustedDevice]),
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    DevicesService,
    TrustedDeviceRepository,
  ],
  exports: [AuthService, JwtStrategy, JwtRefreshTokenStrategy, PassportModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExtendedRequest, Fingerprint).forRoutes("*");
  }
}
