import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from '../entities/workflow.entity';
import { BaseRepository } from '../../../database/abstract/repository.abstract';
import { Pagination } from 'src/shared/interfaces/pagination.interface';
import { PaginatedResource } from 'src/shared/dto/pagination.dto';

@Injectable()
export class WorkflowRepository extends BaseRepository<Workflow> {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
  ) {
    super(Workflow, workflowRepository, 'trusted_devices');
  }

  async listWorkflowsByUserId(
    userId: string,
    pagination: Pagination,
  ): Promise<PaginatedResource<Workflow>> {
    try {
      const [workflows, total] = await this.workflowRepository.findAndCount({
        where: { userId },
        select: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
        order: {
          createdAt: 'DESC',
        },
        take: pagination.limit,
        skip: pagination.offset,
      });

      return {
        totalItems: total,
        items: workflows,
        page: pagination.page,
        size: pagination.size,
      };
    } catch (error) {
      throw error;
    }
  }
}
