import { HttpStatus } from '@nestjs/common';

import { QueryFailedError, EntityNotFoundError } from 'typeorm';

export class DatabaseException extends Error {
  public readonly status: HttpStatus;
  public readonly errorCode: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: string = 'DATABASE_ERROR',
    originalError?: Error,
  ) {
    super(message);
    this.name = 'DatabaseException';
    this.status = status;
    this.errorCode = errorCode;
    this.originalError = originalError;
  }

  static fromDatabaseError(error: Error): DatabaseException {
    if (error instanceof EntityNotFoundError) {
      return new DatabaseException(
        'Entity Not Found',
        HttpStatus.NOT_FOUND,
        'ENTITY_NOT_FOUND',
        error,
      );
    }

    if (error instanceof QueryFailedError) {
      if ((error as any).code === '23505') {
        return new DatabaseException(
          'Duplicate entry',
          HttpStatus.CONFLICT,
          'UNIQUE_CONSTRAINT_VIOLATION',
          error,
        );
      }

      if ((error as any).code === '23503') {
        return new DatabaseException(
          'Reference constraint violation',
          HttpStatus.BAD_REQUEST,
          'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          error,
        );
      }
    }

    return new DatabaseException(
      'Database error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DATABASE_ERROR',
      error,
    );
  }
}
