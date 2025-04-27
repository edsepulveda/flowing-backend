import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './core/logger/logger.module';
import { HealthModule } from './core/health/health.module';
import { AllExceptionsFilter } from './common/exceptions/filter/http.filter';
import { DatabaseExceptionFilter } from './common/exceptions/filter/database.filter';
import { appConfig } from './common/config/app.config';
import { AuthModule } from './core/modules/auth/auth.module';
import { UsersModule } from './core/modules/users/users.module';
import { JwtAuthGuard } from './core/modules/auth/guards/jwt-auth.guard';
import { DevicesModule } from './core/modules/devices/devices.module';
import { WorkflowsModule } from './core/modules/workflows/workflows.module';

@Module({
  imports: [
    ConfigModule.forRoot(appConfig),
    LoggerModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DevicesModule,
    WorkflowsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
