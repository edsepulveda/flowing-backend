import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { format } from 'winston';
import { join } from 'path';


@Injectable()
export class AppLogger implements LoggerService {
  private context?: string;
  private logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    const logDir = this.configService.get<string>('LOG_DIR', 'logs');
    const logLevel = environment === 'production' ? 'warn' : 'debug';

    // Define log formats
    const consoleFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} ${level.toUpperCase().padEnd(7)} ${contextStr.padEnd(25)} ${message} ${metaStr}`;
      }),
      format.colorize({ all: true }),
    );

    const fileFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.json(),
    );

    // Create transports
    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: logLevel,
        format: consoleFormat,
      }),
    ];

    // Add file transports in production
    if (environment === 'production') {
      // Error log - Contains only error level logs
      transports.push(
        new winston.transports.DailyRotateFile({
          level: 'error',
          dirname: join(logDir, 'error'),
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: fileFormat,
        }),
      );

      // Combined logs - Contains all logs (error, warn, info, etc.)
      transports.push(
        new winston.transports.DailyRotateFile({
          level: 'info',
          dirname: join(logDir, 'combined'),
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: fileFormat,
        }),
      );
    } else {
      // Development application log - All logs including debug
      transports.push(
        new winston.transports.DailyRotateFile({
          level: 'debug',
          dirname: join(logDir, 'application'),
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '7d',
          format: fileFormat,
        }),
      );
    }

    // Create logger instance
    this.logger = winston.createLogger({
      level: logLevel,
      levels: winston.config.npm.levels,
      format: format.combine(
        format.timestamp(),
        format.metadata({ fillExcept: ['timestamp', 'level', 'message', 'context'] }),
      ),
      transports,
      exitOnError: false,
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: any, context?: string): void {
    this.logger.info(this.formatMessage(message), { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(this.formatMessage(message), { 
      context: context || this.context,
      trace 
    });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(this.formatMessage(message), { context: context || this.context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(this.formatMessage(message), { context: context || this.context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(this.formatMessage(message), { context: context || this.context });
  }

  private formatMessage(message: any): string {
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }
    return message;
  }

  createChildLogger(context: string): LoggerService {
    const childLogger = new AppLogger(this.configService);
    childLogger.setContext(context);
    return childLogger;
  }
}

