export interface WorkflowFilter {
  search?: string;
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}