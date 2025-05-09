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

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  create(@Body() createWorkflowDto: CreateWorkflowDto, @GetUser() user: Users) {
    return this.workflowsService.createWorkflow(createWorkflowDto, user.id);
  }

  @Get()
  findWorkflowsByUserId(
    @GetUser() user: Users,
    @PaginationParams() pagination: Pagination,
  ) {
    return this.workflowsService.listWorkflowsByUserId(user.id, pagination);
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
