/**
 * Constants and configuration for TCBS explorer
 */

/**
 * Base endpoints for different TCBS API services
 */
export const TCBS_API_ENDPOINTS = {
  /** Stock insights API base URL */
  STOCK_INSIGHT: 'https://apipubaws.tcbs.com.vn/stock-insight/v1/stock',
  /** Company analysis API base URL */
  COMPANY: 'https://apipubaws.tcbs.com.vn/tcanalysis/v1/company',
  /** Market data API base URL */
  MARKET: 'https://apipubaws.tcbs.com.vn/market/v1',
  /** Technical analysis API base URL */
  TECHNICAL: 'https://apipubaws.tcbs.com.vn/technical-analysis/v1',
  /** Stock screener API base URL */
  SCREENER: 'https://apipubaws.tcbs.com.vn/screener/v1/scanner',
};

/**
 * Specific API endpoints for different data types
 */
export const TCBS_ENDPOINTS = {
  /** Stock quote endpoint */
  QUOTE: `${TCBS_API_ENDPOINTS.STOCK_INSIGHT}/quote`,
  /** Intraday data endpoint */
  INTRADAY: `${TCBS_API_ENDPOINTS.STOCK_INSIGHT}/intraday`,
  /** Historical OHLC data endpoint */
  HISTORICAL: `${TCBS_API_ENDPOINTS.STOCK_INSIGHT}/historical`,
  /** Company profile endpoint */
  COMPANY_PROFILE: `${TCBS_API_ENDPOINTS.COMPANY}/profile`,
  /** Financial statement endpoint */
  FINANCIAL_STATEMENT: `${TCBS_API_ENDPOINTS.COMPANY}/financial-statement`,
  /** Financial ratio endpoint */
  FINANCIAL_RATIO: `${TCBS_API_ENDPOINTS.COMPANY}/financial-ratios`,
  /** Ownership structure endpoint */
  OWNERSHIP: `${TCBS_API_ENDPOINTS.COMPANY}/ownership`,
  /** Company executives endpoint */
  EXECUTIVES: `${TCBS_API_ENDPOINTS.COMPANY}/executives`,
  /** Company subsidiaries endpoint */
  SUBSIDIARIES: `${TCBS_API_ENDPOINTS.COMPANY}/subsidiaries`,
  /** Business model endpoint */
  BUSINESS_MODEL: `${TCBS_API_ENDPOINTS.COMPANY}/business-model`,
  /** Dividend history endpoint */
  DIVIDEND_HISTORY: `${TCBS_API_ENDPOINTS.COMPANY}/dividend-history`,
  /** Industry classification endpoint */
  INDUSTRY: `${TCBS_API_ENDPOINTS.MARKET}/industry`,
  /** Stock listing endpoint */
  LISTING: `${TCBS_API_ENDPOINTS.STOCK_INSIGHT}/listing`,
  /** Stock screener endpoint */
  SCREENER: `${TCBS_API_ENDPOINTS.SCREENER}/query`,
  /** Technical indicators endpoint */
  TECHNICAL_INDICATORS: `${TCBS_API_ENDPOINTS.TECHNICAL}/indicators`,
};

/**
 * Resolution for historical data
 */
export enum TcbsResolution {
  /** Daily data points */
  DAILY = 'D',
  /** Weekly data points */
  WEEKLY = 'W',
  /** Monthly data points */
  MONTHLY = 'M',
}

/**
 * Financial reporting periods
 */
export enum TcbsFinancialPeriod {
  /** Quarterly financial reports */
  QUARTERLY = 'QUARTERLY',
  /** Yearly financial reports */
  YEARLY = 'YEARLY',
}

/**
 * Time range options for data retrieval
 */
export enum TcbsTimeRange {
  /** Data from the past day */
  ONE_DAY = '1D',
  /** Data from the past week */
  ONE_WEEK = '1W',
  /** Data from the past month */
  ONE_MONTH = '1M',
  /** Data from the past 3 months */
  THREE_MONTHS = '3M',
  /** Data from the past 6 months */
  SIX_MONTHS = '6M',
  /** Data from the past year */
  ONE_YEAR = '1Y',
  /** Data from the past 3 years */
  THREE_YEARS = '3Y',
  /** Data from the past 5 years */
  FIVE_YEARS = '5Y',
  /** Data from the beginning of available history */
  ALL = 'ALL',
}

/**
 * Types of financial statements
 */
export enum TcbsFinancialStatementType {
  /** Income statement (Profit & Loss) */
  INCOME_STATEMENT = 'incomestatement',
  /** Balance sheet */
  BALANCE_SHEET = 'balancesheet',
  /** Cash flow statement */
  CASH_FLOW = 'cashflow',
}

/**
 * Report types for financial data
 */
export enum TcbsReportType {
  /** Consolidated financial statements (group level) */
  CONSOLIDATED = 'CONSOLIDATED',
  /** Separate financial statements (parent company only) */
  SEPARATE = 'SEPARATE',
}

/**
 * Industry classification level
 */
export enum TcbsIndustryLevel {
  /** Sector level (highest level) */
  SECTOR = 1,
  /** Industry group level */
  INDUSTRY_GROUP = 2,
  /** Industry level */
  INDUSTRY = 3,
  /** Sub-industry level (most specific) */
  SUB_INDUSTRY = 4,
}

/**
 * Stock exchange codes
 */
export enum TcbsExchange {
  /** Ho Chi Minh Stock Exchange */
  HOSE = 'HOSE',
  /** Hanoi Stock Exchange */
  HNX = 'HNX',
  /** Unlisted Public Company Market */
  UPCOM = 'UPCOM',
}

/**
 * Exchange codes mapping to full names
 */
export const TCBS_EXCHANGE_NAMES: Record<TcbsExchange, string> = {
  [TcbsExchange.HOSE]: 'Ho Chi Minh Stock Exchange',
  [TcbsExchange.HNX]: 'Hanoi Stock Exchange',
  [TcbsExchange.UPCOM]: 'Unlisted Public Company Market',
};

/**
 * Technical indicator types
 */
export enum TcbsTechnicalIndicator {
  /** Simple Moving Average */
  SMA = 'SMA',
  /** Exponential Moving Average */
  EMA = 'EMA',
  /** Relative Strength Index */
  RSI = 'RSI',
  /** Moving Average Convergence Divergence */
  MACD = 'MACD',
  /** Bollinger Bands */
  BBANDS = 'BBANDS',
  /** Stochastic Oscillator */
  STOCH = 'STOCH',
  /** Average Directional Index */
  ADX = 'ADX',
  /** Average True Range */
  ATR = 'ATR',
  /** On-Balance Volume */
  OBV = 'OBV',
  /** Commodity Channel Index */
  CCI = 'CCI',
}

/**
 * Default parameters for technical indicators
 */
export const TCBS_INDICATOR_DEFAULTS: Record<
  TcbsTechnicalIndicator,
  Record<string, number>
> = {
  [TcbsTechnicalIndicator.SMA]: { period: 20 },
  [TcbsTechnicalIndicator.EMA]: { period: 20 },
  [TcbsTechnicalIndicator.RSI]: { period: 14 },
  [TcbsTechnicalIndicator.MACD]: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
  },
  [TcbsTechnicalIndicator.BBANDS]: { period: 20, stdDev: 2 },
  [TcbsTechnicalIndicator.STOCH]: { kPeriod: 14, dPeriod: 3, slowing: 3 },
  [TcbsTechnicalIndicator.ADX]: { period: 14 },
  [TcbsTechnicalIndicator.ATR]: { period: 14 },
  [TcbsTechnicalIndicator.OBV]: {},
  [TcbsTechnicalIndicator.CCI]: { period: 20 },
};

/**
 * Screener field types
 */
export enum TcbsScreenerField {
  // Price related
  PRICE = 'priceValue',
  MARKET_CAP = 'marketCap',
  VOLUME = 'volume',

  // Valuation metrics
  PE = 'pe',
  PB = 'pb',
  PS = 'ps',

  // Financial metrics
  ROE = 'roe',
  ROA = 'roa',
  EPS = 'eps',
  NET_PROFIT = 'netProfit',
  REVENUE = 'revenue',

  // Technical indicators
  RSI = 'rsi',
}

/**
 * Screener operators
 */
export enum TcbsScreenerOperator {
  EQUAL = 'eq',
  NOT_EQUAL = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'nin',
}

/**
 * Error codes and messages
 */
export const TCBS_ERROR_CODES: Record<string, string> = {
  SYMBOL_NOT_FOUND: 'The requested stock symbol was not found',
  INVALID_DATE_RANGE: 'The provided date range is invalid',
  RATE_LIMIT_EXCEEDED: 'API rate limit has been exceeded',
  INVALID_PARAMETER: 'One or more parameters are invalid',
  SERVER_ERROR: 'TCBS server encountered an error',
  SERVICE_UNAVAILABLE: 'TCBS service is currently unavailable',
};

/**
 * Default request timeout in milliseconds
 */
export const TCBS_DEFAULT_TIMEOUT = 30000;

/**
 * Maximum number of symbols allowed in batch requests
 */
export const TCBS_MAX_BATCH_SIZE = 20;

/**
 * Date format for API requests (following moment.js format)
 */
export const TCBS_DATE_FORMAT = 'YYYY-MM-DD';
