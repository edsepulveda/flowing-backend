import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DatabaseException } from '../database.exception';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      message: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        errorResponse = {
          ...errorResponse,
          ...exceptionResponse,
          statusCode: status,
        };
      } else {
        errorResponse.message = exceptionResponse;
      }
    } else if (exception instanceof DatabaseException) {
      status = exception.status;
      errorResponse = {
        statusCode: status,
        message: exception.message,
        errorCode: exception.errorCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else if (exception instanceof Error) {
      errorResponse.message = exception.message;
    }

    const logMessage = `${request.method} ${request.url} - ${status} - ${errorResponse.message}`;

    if (status >= 500) {
      this.logger.error(logMessage, (exception as Error).stack);
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.debug(logMessage);
    }

    response.status(status).json(errorResponse);
  }
}
