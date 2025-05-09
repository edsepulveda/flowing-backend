import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { WorkflowFilter } from 'src/common/interfaces/workflow.interface';

export const WorkflowFilterParams = createParamDecorator(
  (data, ctx: ExecutionContext): WorkflowFilter => {
    const req: Request = ctx.switchToHttp().getRequest();
    const filter: WorkflowFilter = {};
    
    if (req.query.search) {
      filter.search = req.query.search as string;
    }
    
    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        filter.status = req.query.status as string[];
      } else {
        filter.status = [req.query.status as string];
      }
    }
    
    if (req.query.dateFrom) {
      filter.dateFrom = new Date(req.query.dateFrom as string);
      
      if (isNaN(filter.dateFrom.getTime())) {
        delete filter.dateFrom;
      }
    }
    
    if (req.query.dateTo) {
      filter.dateTo = new Date(req.query.dateTo as string);
      
      if (isNaN(filter.dateTo.getTime())) {
        delete filter.dateTo;
      }
    }
    
    if (req.query.sortBy) {
      filter.sortBy = req.query.sortBy as string;
    }
    
    if (req.query.sortDirection) {
      const direction = (req.query.sortDirection as string).toUpperCase();
      
      if (direction === 'ASC' || direction === 'DESC') {
        filter.sortDirection = direction as 'ASC' | 'DESC';
      }
    }
    
    return filter;
  },
);