import { Response } from "express";

interface Pagination {
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
}

interface SendResponseOptions<T> {
  is_show?: boolean;
  data?: T | T[];
  pagination?: Pagination;
  meta?: any;
}

/**
 * Sends a standard API response structure
 */
export function sendApiResponse<T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  options: SendResponseOptions<T> = {}
) {
  const {
    is_show = false,
    data = [],
    pagination,
    meta
  } = options;

  const response: Record<string, any> = {
    status: success,
    message,
    is_show,
    data,
  };

  if (pagination) response.pagination = pagination;
  if (meta) response.meta = meta;

  return res.status(statusCode).json(response);
}
