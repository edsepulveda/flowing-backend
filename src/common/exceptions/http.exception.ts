import { HttpException, HttpStatus } from '@nestjs/common';


export class HttpCatchException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: string = 'INTERNAL_SERVER_ERROR',
  ) {
    super(
      {
        statusCode: status,
        message,
        errorCode,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }

  static badRequest(message: string, errorCode: string = 'BAD_REQUEST'): HttpCatchException {
    return new HttpCatchException(message, HttpStatus.BAD_REQUEST, errorCode);
  }

  static unauthorized(message: string = 'Unauthorized', errorCode: string = 'UNAUTHORIZED'): HttpCatchException {
    return new HttpCatchException(message, HttpStatus.UNAUTHORIZED, errorCode);
  }

  static forbidden(message: string = 'Forbidden', errorCode: string = 'FORBIDDEN'): HttpCatchException {
    return new HttpCatchException(message, HttpStatus.FORBIDDEN, errorCode);
  }

  static notFound(message: string = 'Not Found', errorCode: string = 'NOT_FOUND'): HttpCatchException {
    return new HttpCatchException(message, HttpStatus.NOT_FOUND, errorCode);
  }

  static conflict(message: string, errorCode: string = 'CONFLICT'): HttpCatchException {
    return new HttpCatchException(message, HttpStatus.CONFLICT, errorCode);
  }

}