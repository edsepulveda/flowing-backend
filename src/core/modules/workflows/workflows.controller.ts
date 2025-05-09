import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { GetUser } from '../auth/decorators/get-user';
import { PaginationParams } from 'src/shared/decorators/pagination.decorator';
import { Pagination } from 'src/shared/interfaces/pagination.interface';
import { Users } from '../users/entities/user.entity';
import { ApiOperation } from '@nestjs/swagger';
import { WorkflowFilterParams } from 'src/shared/decorators/workflow-filters.decorator';
import { WorkflowFilter } from 'src/common/interfaces/workflow.interface';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  create(@Body() createWorkflowDto: CreateWorkflowDto, @GetUser() user: Users) {
    return this.workflowsService.createWorkflow(createWorkflowDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List workflows with filtering and pagination' })
  findWorkflowsByUserId(
    @GetUser() user: Users,
    @PaginationParams({ page: 1, size: 10 }) pagination: Pagination,
    @WorkflowFilterParams() filter: WorkflowFilter,
  ) {
    return this.workflowsService.listWorkflowsByUserId(
      user.id,
      pagination,
      filter,
    );
  }

  @Get(':id')
  findWorkflowById(@GetUser() user: Users, @Param('id') id: string) {
    return this.workflowsService.getWorkflowById(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: Users,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.updateWorkflow(id, user.id, updateWorkflowDto);
  }

  @Patch('publish/:id')
  publishWorkflow(@Param('id') id: string) {
    return this.workflowsService.publishWorkflow(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowsService.deleteWorkflow(id);
  }
}
