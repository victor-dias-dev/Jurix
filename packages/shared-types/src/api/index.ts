/**
 * Resposta padrão da API para sucesso
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Resposta padrão da API para erro
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Parâmetros de ordenação
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filtros para listagem de contratos
 */
export interface ContractFilters extends PaginationParams, SortParams {
  status?: string;
  createdById?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

