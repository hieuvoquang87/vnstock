/**
 * Configuration constants for vnstock-ts
 */
import {
  DataSource,
  LogLevel,
  TradingHours,
  VnstockConfig,
} from '../../types/config';

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: VnstockConfig = {
  apiTimeout: 30000, // 30 seconds
  maxRetries: 3,
  userAgent: 'vnstock-ts/1.0.0',
  defaultSource: DataSource.VCI,
  logLevel: LogLevel.INFO,
  cacheEnabled: true,
  cacheDuration: 300000, // 5 minutes in milliseconds
};

/**
 * Market trading hours by exchange
 */
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

/**
 * API endpoints by data source
 */
export const API_ENDPOINTS = {
  [DataSource.VCI]: {
    baseUrl: 'https://trading.vietcap.com.vn/api',
    tradingUrl: 'https://trading.vietcap.com.vn/api',
    mtUrl: 'https://mt.vietcap.com.vn/api',
    graphqlUrl: 'https://api.vietcap.com.vn/data-mt/graphql',
    quote: '/price/symbols/getList',
    quoteHistory: '/chart/OHLCChart/gap',
    intraday: '/market-watch/LEData/getAll',
    priceDepth: '/market-watch/AccumulatedPriceStepVol/getSymbolData',
    company: '/company/profile',
    financial: '/finance/financial_report',
    listing: '/price/symbols/getAll',
    ownership: '/company/ownership',
    screener: '/screener/filter',
    news: '/news/latest',
  },
  [DataSource.TCBS]: {
    baseUrl: 'https://apipubaws.tcbs.com.vn',
    quote: '/p/v1/stock/quote',
    history: '/p/v1/stock/historical',
    intraday: '/p/v1/stock/intraday',
    company: '/p/v1/company/profile',
    financial: '/p/v1/stock/financial-report',
    listing: '/p/v1/stock/listing',
    ownership: '/p/v1/company/ownership',
    screener: '/p/v1/screener',
    news: '/p/v1/news',
  },
  [DataSource.SSI]: {
    baseUrl: 'https://iboard.ssi.com.vn/api/v2',
    quote: '/stock/snapshot',
    intraday: '/stock/intraday',
    company: '/company/profile',
    financial: '/company/financial',
    listing: '/stock/listing',
  },
  [DataSource.VND]: {
    baseUrl: 'https://api-finfo.vndirect.com.vn/v4',
    quote: '/stock_prices',
    company: '/company_profiles',
    financial: '/financial_reports',
    listing: '/stocks',
  },
  [DataSource.MSN]: {
    baseUrl: 'https://realtimeapi.msn.com/finance',
    quote: '/quote',
    listing: '/symbols',
    news: '/news',
  },
};

/**
 * Default request headers
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Vietnamese exchanges
 */
export const EXCHANGES = ['HOSE', 'HNX', 'UPCOM'];

/**
 * Asset types
 */
export const ASSET_TYPES = [
  'stock',
  'index',
  'etf',
  'future',
  'bond',
  'covered_warrant',
];

/**
 * Configuration manager class for vnstock
 */
export class ConfigManager {
  private config: VnstockConfig;

  constructor(customConfig: Partial<VnstockConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  /**
   * Get a configuration value
   * @param key - Configuration key
   * @returns The configuration value
   */
  get<K extends keyof VnstockConfig>(key: K): VnstockConfig[K] {
    return this.config[key];
  }

  /**
   * Set a configuration value
   * @param key - Configuration key
   * @param value - New value
   */
  set<K extends keyof VnstockConfig>(key: K, value: VnstockConfig[K]): void {
    this.config[key] = value;
  }

  /**
   * Get the entire configuration object
   * @returns Copy of the current configuration
   */
  getAll(): VnstockConfig {
    return { ...this.config };
  }
}
