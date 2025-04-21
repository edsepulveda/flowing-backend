import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { DatabaseException } from '../database.exception';

@Catch(QueryFailedError, EntityNotFoundError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError | EntityNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const databaseException = DatabaseException.fromDatabaseError(exception);
    
    const status = databaseException.status;
    const errorResponse = {
      statusCode: status,
      message: databaseException.message,
      errorCode: databaseException.errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `Database error: ${databaseException.message} - ${request.method} ${request.url}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}