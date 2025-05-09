import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { Status } from '../entities/workflow.entity'

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(Status)
  @IsOptional()
  status?: Status

  @IsString()
  @IsOptional()
  metadata?: Record<string, any>
}
