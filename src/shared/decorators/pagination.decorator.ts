import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { HttpCatchException } from '../../common/exceptions/http.exception';

export const PaginationParams = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = parseInt(req.query.page as string);
    const size = parseInt(req.query.size as string);

    if (isNaN(page) || page < 0 || isNaN(size) || size < 0) {
      throw HttpCatchException.badRequest('Invalid pagination params');
    }

    if (size > 100) {
      throw HttpCatchException.badRequest(
        'Invalid pagination params: Max size is 100',
      );
    }

    const limit = size;
    const offset = page * limit;
    return { page, limit, size, offset };
  },
);
