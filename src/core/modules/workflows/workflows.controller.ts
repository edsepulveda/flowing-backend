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

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowsService.createWorkflow(createWorkflowDto);
  }

  @Get()
  findWorkflowsByUserId(
    @GetUser() user: any,
    @PaginationParams() pagination: Pagination,
  ) {
    return this.workflowsService.listWorkflowsByUserId(user.id, pagination);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.updateWorkflow(id, updateWorkflowDto);
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
