# Core Modules for Initial Implementation

This document outlines the core modules that should be implemented first to establish the foundation of the vnstock TypeScript library. These modules serve as the building blocks for the entire codebase and should be prioritized in the initial development phase.

## 1. Logger Module (`src/core/utils/logger.ts`)

The logger module provides consistent logging functionality throughout the application.

### Key Features

- Log levels (debug, info, warning, error)
- Formatted output with timestamps and module names
- Optional console and/or file output
- Configurable log levels by module

### Implementation Example

```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warning(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export class LoggerImpl implements Logger {
  private name: string;
  private level: LogLevel;

  constructor(name: string, level: LogLevel = LogLevel.INFO) {
    this.name = name;
    this.level = level;
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warning(message: string, ...args: any[]): void {
    this.log(LogLevel.WARNING, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    console.log(
      `[${timestamp}] [${levelStr}] [${this.name}] ${message}`,
      ...args
    );
  }
}

export function createLogger(name: string, level?: LogLevel): Logger {
  return new LoggerImpl(name, level);
}
```

## 2. HTTP Client (`src/core/utils/client.ts`)

The HTTP client handles all API communication with proper error handling, retries, and response parsing.

### Key Features

- Configurable request options
- Error handling with typed errors
- Automatic retries for transient failures
- Response parsing and validation
- Support for various content types

### Implementation Example

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createLogger, Logger } from './logger';

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

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private axios: AxiosInstance;
  private logger: Logger;
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      timeout: 10000,
      maxRetries: 3,
      ...config,
    };

    this.logger = createLogger('HttpClient');

    this.axios = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    let attempt = 0;
    const maxRetries = this.config.maxRetries || 0;

    while (true) {
      attempt++;
      try {
        const response = await this.axios.request<T>(config);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            const { status, statusText } = error.response;
            const url = error.config?.url || 'unknown';

            this.logger.error(`API error: ${status} ${statusText} for ${url}`);

            throw new ApiError(
              status,
              statusText,
              url,
              `API request failed: ${status} ${statusText}`
            );
          } else if (error.request) {
            this.logger.error(`Network error: ${error.message}`);

            if (attempt <= maxRetries) {
              const delay = Math.pow(2, attempt) * 100;
              this.logger.info(
                `Retrying request (${attempt}/${maxRetries}) after ${delay}ms`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            }

            throw new ConnectionError(`Network error: ${error.message}`);
          }
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw error;
      }
    }
  }
}
```

## 3. Configuration Module (`src/core/config/const.ts`)

The configuration module provides centralized access to constants and configuration values.

### Key Features

- Default configuration values
- Environment-specific overrides
- Runtime configuration
- Type-safe access to configuration values

### Implementation Example

```typescript
export interface VnstockConfig {
  apiTimeout: number;
  maxRetries: number;
  userAgent: string;
  defaultSource: 'VCI' | 'TCBS' | 'MSN';
  logLevel: 'debug' | 'info' | 'warning' | 'error';
}

export const DEFAULT_CONFIG: VnstockConfig = {
  apiTimeout: 30000,
  maxRetries: 3,
  userAgent: 'vnstock-ts/1.0.0',
  defaultSource: 'VCI',
  logLevel: 'info',
};

// Market trading hours
export interface TradingHours {
  open: string; // '09:00'
  close: string; // '15:00'
  breakStart?: string; // '11:30'
  breakEnd?: string; // '13:00'
}

export const MARKET_HOURS: Record<string, TradingHours> = {
  HOSE: {
    open: '09:00',
    close: '15:00',
    breakStart: '11:30',
    breakEnd: '13:00',
  },
  HNX: {
    open: '09:00',
    close: '15:00',
    breakStart: '11:30',
    breakEnd: '13:00',
  },
  UPCOM: {
    open: '09:00',
    close: '15:00',
    breakStart: '11:30',
    breakEnd: '13:00',
  },
};

// Data sources
export const API_ENDPOINTS = {
  VCI: {
    BASE_URL: 'https://api.vietstock.vn/api/data',
    QUOTE: '/derivatives/prices',
    COMPANY: '/company/profile',
    FINANCIAL: '/finance/financial_report',
    // ...other endpoints
  },
  TCBS: {
    BASE_URL: 'https://api.tcbs.com.vn',
    QUOTE: '/stock-insight/v1/stock/bars',
    COMPANY: '/stock-insight/v1/company/profile',
    FINANCIAL: '/stock-insight/v1/stock/financial-report',
    // ...other endpoints
  },
  // ...other sources
};

// Export a configuration manager
export class ConfigManager {
  private config: VnstockConfig;

  constructor(customConfig: Partial<VnstockConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  get<K extends keyof VnstockConfig>(key: K): VnstockConfig[K] {
    return this.config[key];
  }

  set<K extends keyof VnstockConfig>(key: K, value: VnstockConfig[K]): void {
    this.config[key] = value;
  }

  getAll(): VnstockConfig {
    return { ...this.config };
  }
}
```

## 4. Data Models (`src/types/models.ts`)

Core data models define the structure of financial data throughout the application.

### Key Features

- Type definitions for all data structures
- Interface hierarchies for related types
- Utility types for transformations
- Validation functions

### Implementation Example

```typescript
// Base ticker model
export interface Ticker {
  symbol: string;
  exchange: string;
}

// Price data
export interface PriceData {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change?: number;
  changePercent?: number;
}

// Historical price data response
export interface HistoricalPriceResponse {
  data: PriceData[];
  symbol: string;
  timeframe: string;
  from: string;
  to: string;
}

// Company information
export interface CompanyProfile {
  symbol: string;
  exchange: string;
  companyName: string;
  industryID: number;
  industry: string;
  established: string;
  website: string;
  overview: string;
  employees: number;
  address: string;
  phone: string;
  revenue?: number;
  profit?: number;
}

// Financial statement types
export enum FinancialStatementType {
  INCOME = 'income',
  BALANCE = 'balance',
  CASH_FLOW = 'cashflow',
}

// Financial statement period
export enum FinancialPeriod {
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// Financial statement data
export interface FinancialStatement {
  symbol: string;
  type: FinancialStatementType;
  period: FinancialPeriod;
  year: number;
  quarter?: number;
  items: Record<string, number>;
}

// Common API response wrapper
export interface ApiResponse<T> {
  status: string;
  data: T;
  error?: string;
}

// Helper type for filtering records
export type FilterOptions<T> = {
  [K in keyof T]?: T[K] | T[K][];
};

// Helper type for sorting
export interface SortOptions<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}
```

## 5. Base Data Source (`src/explorer/base.ts`)

The base data source provides common functionality for all data source implementations.

### Key Features

- Common interface for all data sources
- Shared functionality for authentication and requests
- Configuration handling
- Error management

### Implementation Example

```typescript
import { HttpClient } from '../core/utils/client';
import { createLogger, Logger } from '../core/utils/logger';
import { ConfigManager } from '../core/config/const';

export abstract class BaseDataSource {
  protected httpClient: HttpClient;
  protected logger: Logger;
  protected config: ConfigManager;

  constructor(
    baseURL: string,
    headers: Record<string, string> = {},
    configOverrides: Record<string, any> = {}
  ) {
    this.config = new ConfigManager(configOverrides);

    this.httpClient = new HttpClient({
      baseURL,
      timeout: this.config.get('apiTimeout'),
      maxRetries: this.config.get('maxRetries'),
      headers: {
        'User-Agent': this.config.get('userAgent'),
        ...headers,
      },
    });

    this.logger = createLogger(this.constructor.name);
  }

  protected validateSymbol(symbol: string): string {
    if (!symbol || symbol.trim() === '') {
      throw new Error('Symbol cannot be empty');
    }
    return symbol.toUpperCase().trim();
  }

  protected validateDateRange(fromDate: string, toDate: string): void {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime())) {
      throw new Error(`Invalid from date: ${fromDate}`);
    }

    if (isNaN(to.getTime())) {
      throw new Error(`Invalid to date: ${toDate}`);
    }

    if (from > to) {
      throw new Error('From date must be before to date');
    }
  }

  protected abstract getAuthHeaders(): Record<string, string>;
}
```

## 6. Core Utilities (`src/core/utils/transform.ts`)

Utilities for data transformation and manipulation that are used throughout the application.

### Key Features

- Data format conversion
- Type transformations
- Validation helpers
- Common manipulations

### Implementation Example

```typescript
import { PriceData, FinancialStatement } from '../../types/models';

// Convert snake_case to camelCase
export function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

// Convert camelCase to snake_case
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Transform object keys from snake_case to camelCase
export function transformKeys<T extends Record<string, any>>(
  obj: Record<string, any>,
  transformer: (key: string) => string = snakeToCamel
): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformer)) as any;
  }

  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];
    const transformedKey = transformer(key);

    result[transformedKey] =
      typeof value === 'object' && value !== null
        ? transformKeys(value, transformer)
        : value;

    return result;
  }, {} as T);
}

// Calculate percent change between two values
export function calculatePercentChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(2));
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// Convert price data array to DataFrame-like object with typed columns
export function createDataFrame<T extends Record<string, any>>(
  data: T[]
): Record<keyof T, Array<T[keyof T]>> {
  if (!data.length) return {} as Record<keyof T, Array<T[keyof T]>>;

  const result = {} as Record<keyof T, Array<T[keyof T]>>;
  const keys = Object.keys(data[0]) as Array<keyof T>;

  keys.forEach((key) => {
    result[key] = data.map((row) => row[key]);
  });

  return result;
}

// Filter an array of objects based on criteria
export function filterData<T extends Record<string, any>>(
  data: T[],
  criteria: Partial<T>
): T[] {
  return data.filter((item) =>
    Object.entries(criteria).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      return item[key] === value;
    })
  );
}
```

## Implementation Priority

1. **Logger Module** - Implement first for debugging during development
2. **Config Module** - Centralized configuration for all components
3. **HTTP Client** - Core networking capabilities
4. **Data Models** - Type definitions for consistent data handling
5. **Transform Utilities** - Common data transformation functions
6. **Base Data Source** - Foundation for all data sources

By implementing these core modules first, we establish a solid foundation for the rest of the library. These modules provide essential functionality that will be used by all other components.
