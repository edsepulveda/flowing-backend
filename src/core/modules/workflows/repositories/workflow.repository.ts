import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Workflow } from '../entities/workflow.entity';
import { BaseRepository } from '../../../database/abstract/repository.abstract';
import { Pagination } from 'src/shared/interfaces/pagination.interface';
import { PaginatedResource } from 'src/shared/dto/pagination.dto';
import { WorkflowFilter } from 'src/common/interfaces/workflow.interface';
import { HttpCatchException } from 'src/common/exceptions/http.exception';

@Injectable()
export class WorkflowRepository extends BaseRepository<Workflow> {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
  ) {
    super(Workflow, workflowRepository, 'workflow');
  }

  async findUserWorkflows(
    userId: string,
    pagination: Pagination,
    filter?: WorkflowFilter,
  ): Promise<PaginatedResource<Workflow>> {
    try {
      const queryBuilder = this.workflowRepository
        .createQueryBuilder('workflow')
        .where('workflow.userId = :userId', { userId });

      this.applyFilters(queryBuilder, filter);

      this.applySorting(queryBuilder, filter);

      const skip = (pagination.page - 1) * pagination.size;
      const take = pagination.size;

      const [workflows, total] = await queryBuilder
        .select([
          'workflow.id',
          'workflow.name',
          'workflow.description',
          'workflow.createdAt',
          'workflow.updatedAt',
          'workflow.status',
        ])
        .skip(skip)
        .take(take)
        .getManyAndCount();

      return {
        totalItems: total,
        items: workflows,
        page: pagination.page,
        size: pagination.size,
        totalPages: Math.ceil(total / pagination.size),
        hasNextPage: pagination.page < Math.ceil(total / pagination.size),
        hasPreviousPage: pagination.page > 1,
      };
    } catch (error) {
      const errorMsg = `Failed to fetch workflows: ${error.message}`;
      this.logger.error(errorMsg);
      throw new HttpCatchException(errorMsg);
    }
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Workflow>,
    filter?: WorkflowFilter,
  ) {
    if (!filter) return;

    if (filter.search) {
      queryBuilder.andWhere(
        '(workflow.name ILIKE :search OR workflow.description ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.status && filter.status.length > 0) {
      queryBuilder.andWhere('workflow.status IN (:...statuses)', {
        statuses: filter.status,
      });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Workflow>,
    filter?: WorkflowFilter,
  ) {
    const sortBy = filter?.sortBy || 'createdAt';
    const sortDirection = filter?.sortDirection || 'DESC';

    const allowedSortFields = [
      'name',
      'description',
      'status',
      'createdAt',
      'updatedAt',
    ];

    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(`workflow.${sortBy}`, sortDirection);
    } else {
      queryBuilder.orderBy('workflow.createdAt', 'DESC');
    }
  }
}
