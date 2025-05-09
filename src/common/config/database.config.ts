import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from 'path';
import { AppLogger } from '../../core/logger/logger.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(TypeOrmConfigService.name);
  }

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    const baseOptions: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
    };

    if (isDevelopment) {
      this.logger.log('Running TypeORM in develop mode');
      return {
        ...baseOptions,
        logging: ['error', 'warn', 'query', 'schema'],
        logger: 'advanced-console',
      };
    }
  }
}
