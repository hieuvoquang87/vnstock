/**
 * Configuration type definitions
 */

/**
 * Main configuration interface
 */
export interface VnstockConfig {
  apiTimeout: number;
  maxRetries: number;
  userAgent: string;
  defaultSource: DataSource;
  logLevel: LogLevel;
  cacheEnabled: boolean;
  cacheDuration: number;
  proxyUrl?: string;
}

/**
 * Data source enum
 */
export enum DataSource {
  VCI = 'VCI',
  TCBS = 'TCBS',
  SSI = 'SSI',
  VND = 'VND',
  MSN = 'MSN',
  DNSE = 'DNSE',
  TVSI = 'TVSI',
  WCI = 'WCI',
}

/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  NONE = 'none',
}

/**
 * Trading hours configuration
 */
export interface TradingHours {
  open: string; // Format: 'HH:MM'
  close: string; // Format: 'HH:MM'
  breakStart?: string; // Format: 'HH:MM'
  breakEnd?: string; // Format: 'HH:MM'
}

/**
 * API endpoints configuration
 */
export interface ApiEndpoints {
  baseUrl: string;
  quote: string;
  company: string;
  financial: string;
  ownership: string;
  listing: string;
  screener: string;
  news: string;
  [key: string]: string;
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
