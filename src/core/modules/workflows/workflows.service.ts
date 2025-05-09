import { Injectable } from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowRepository } from './repositories/workflow.repository';
import { AppLogger } from 'src/core/logger/logger.service';
import { HttpCatchException } from 'src/common/exceptions/http.exception';
import { Pagination } from 'src/shared/interfaces/pagination.interface';
import { Status } from './entities/workflow.entity';

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(WorkflowsService.name);
  }

  async createWorkflow(createWorkflowDto: CreateWorkflowDto, userId: string) {
    return await this.workflowRepository.create({
      ...createWorkflowDto,
      status: Status.DRAFT,
      userId: userId,
    });
  }

  async getWorkflowById(id: string, userId: string) {
    const workflow = await this.workflowRepository.findOneBy({ id, userId });

    if (!workflow) {
      throw HttpCatchException.notFound(`Workflow with the id ${id} not found`);
    }

    return workflow;
  }

  async listWorkflowsByUserId(userId: string, pagination: Pagination) {
    const workflows = await this.workflowRepository.listWorkflowsByUserId(
      userId,
      pagination,
    );

    if (!workflows) {
      this.logger.error(
        `Workflows for user with the id ${userId} doesnt exists`,
      );
      throw HttpCatchException.notFound(
        `Workflows for user with the id ${userId} doesnt exists`,
      );
    }

    return workflows;
  }

  async updateWorkflow(
    id: string,
    userId: string,
    updateWorkflowDto: UpdateWorkflowDto,
  ) {
    const workflow = await this.workflowRepository.findOneBy({
      id,
      userId,
    });

    if (!workflow) {
      this.logger.error(
        `Workflow for the user ${userId} with the id ${id} doesnt exists`,
      );
      throw HttpCatchException.notFound(
        `Workflow with the id ${id} doesnt exists`,
      );
    }

    if (workflow.status === 'PUBLISHED') {
      throw HttpCatchException.forbidden(
        `You cannot edit a workflow that has been published`,
      );
    }

    return await this.workflowRepository.update(id, updateWorkflowDto);
  }

  async publishWorkflow(id: string) {
    const workflow = await this.workflowRepository.findOneById(id);

    if (!workflow) {
      throw HttpCatchException.notFound(`Workflow with the id ${id} not found`);
    }

    return await this.workflowRepository.update(id, {
      status: Status.PUBLISHED,
    });
  }

  async deleteWorkflow(id: string) {
    const workflow = await this.workflowRepository.findOneById(id);

    if (!workflow) {
      this.logger.error(`Workflow with the id ${id} doesnt exists`);
      throw HttpCatchException.notFound(
        `Workflow with the id ${id} doesnt exists`,
      );
    }

    return await this.workflowRepository.delete(id);
  }
}
