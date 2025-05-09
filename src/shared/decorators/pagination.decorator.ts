import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { HttpCatchException } from '../../common/exceptions/http.exception';
import { Pagination } from 'src/shared/interfaces/pagination.interface';

export const PaginationParams = createParamDecorator(
  (
    defaultValues: Partial<Pagination> = {},
    ctx: ExecutionContext,
  ): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();

    const page = parseInt(req.query.page as string) || defaultValues.page || 1;
    const size = parseInt(req.query.size as string) || defaultValues.size || 10;

    if (page < 1) {
      throw HttpCatchException.badRequest(
        'Page must be greater than or equal to 1',
      );
    }

    if (size < 1) {
      throw HttpCatchException.badRequest(
        'Size must be greater than or equal to 1',
      );
    }

    if (size > 100) {
      throw HttpCatchException.badRequest('Maximum page size is 100');
    }

    return { page, size };
  },
);
