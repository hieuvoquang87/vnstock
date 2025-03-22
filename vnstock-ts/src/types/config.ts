/**
 * Configuration type definitions
 */

/**
 * Data sources enum
 */
export enum DataSource {
  VCI = 'VCI',
  TCBS = 'TCBS',
  SSI = 'SSI',
  VND = 'VND',
  MSN = 'MSN',
  FMARKET = 'FMARKET',
  MISC = 'MISC',
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * API endpoints for data sources
 */
export interface ApiEndpoints {
  baseUrl: string;
  quote?: string;
  listing?: string;
  company?: string;
  financial?: string;
  analysis?: string;
  screener?: string;
  trading?: string;
}

/**
 * Trading hours configuration
 */
export interface TradingHours {
  open: string;
  close: string;
  breakStart?: string;
  breakEnd?: string;
}

/**
 * vnstock configuration
 */
export interface VnstockConfig {
  defaultSource: DataSource;
  apiTimeout: number;
  logLevel: LogLevel;
  maxRetries: number;
  userAgent: string;
  cacheEnabled: boolean;
  cacheDuration: number;
}

/**
 * Industry classification interface
 */
export interface IndustryClassification {
  id: number;
  name: string;
  sector?: number;
  description?: string;
}

/**
 * Sector classification interface
 */
export interface SectorClassification {
  id: number;
  name: string;
  description?: string;
}
