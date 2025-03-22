/**
 * API-related type definitions
 */

/**
 * API response format
 */
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  payload?: any;
  timeout?: number;
  showLog?: boolean;
}

/**
 * HTTP error types
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConnectionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Filter options for data queries
 */
export type FilterOptions<T> = {
  [K in keyof T]?: T[K] | T[K][];
};

/**
 * Sort options for data queries
 */
export interface SortOptions<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Date range parameters
 */
export interface DateRangeParams {
  fromDate: string;
  toDate?: string;
  timeframe?: string;
}

/**
 * Timeframe options for historical data
 */
export type TimeframeOption =
  | '1D'
  | '1W'
  | '1M'
  | '3M'
  | '6M'
  | '1Y'
  | '3Y'
  | '5Y'
  | 'YTD'
  | 'MAX';

/**
 * Interval options for intraday data
 */
export type IntervalOption = '1m' | '5m' | '15m' | '30m' | '1h' | '1D';

/**
 * Language options
 */
export type LanguageOption = 'vi' | 'en';
