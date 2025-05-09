import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { WorkflowRepository } from './repositories/workflow.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from './entities/workflow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow])],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowRepository],
  exports: [WorkflowsService]
})
export class WorkflowsModule {}
