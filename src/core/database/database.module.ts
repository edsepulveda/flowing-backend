import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from '../../common/config/database.config';
import { LoggerModule } from '../logger/logger.module';


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      useClass: TypeOrmConfigService,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}