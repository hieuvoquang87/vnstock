# TCBS Explorer Constants and Configuration

**Original Python Implementation**: [const.py](/vnstock/explorer/tcbs/const.py)


## Overview

This document details the constants, enums, configuration values, and mappings used in the TCBS explorer. These constants serve as reference points for API endpoints, data categorization, and value mappings throughout the explorer implementation.

## API Endpoints

```typescript
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
  QUOTE: (symbol: string) =>
    `${TCBS_API_ENDPOINTS.STOCK_INSIGHT}/quote/${symbol}`,
  /** Intraday data endpoint */
  INTRADAY: (symbol: string) =>
    `${TCBS_API_ENDPOINTS.STOCK_INSIGHT}/intraday/${symbol}`,
  /** Historical OHLC data endpoint */
  HISTORICAL: (symbol: string) =>
    `${TCBS_API_ENDPOINTS.STOCK_INSIGHT}/historical/${symbol}`,
  /** Company profile endpoint */
  COMPANY_PROFILE: (symbol: string) =>
    `${TCBS_API_ENDPOINTS.COMPANY}/profile/${symbol}`,
  /** Financial statement endpoint */
  FINANCIAL_STATEMENT: (symbol: string) =>
    `${TCBS_API_ENDPOINTS.COMPANY}/financial-statement/${symbol}`,
  /** Financial ratio endpoint */
  FINANCIAL_RATIO: (symbol: string) =>
    `${TCBS_API_ENDPOINTS.COMPANY}/financial-ratios/${symbol}`,
  /** Industry classification endpoint */
  INDUSTRY: `${TCBS_API_ENDPOINTS.MARKET}/industry`,
  /** Stock listing endpoint */
  LISTING: `${TCBS_API_ENDPOINTS.STOCK_INSIGHT}/listing`,
  /** Stock screener endpoint */
  SCREENER: `${TCBS_API_ENDPOINTS.SCREENER}/query`,
  /** Technical indicators endpoint */
  TECHNICAL_INDICATORS: (symbol: string) =>
    `${TCBS_API_ENDPOINTS.TECHNICAL}/indicators/${symbol}`,
};
```

## Time Period Enums

```typescript
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
```

## Financial Statement Types

```typescript
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
```

## Industry Classification

```typescript
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
 * Industry classification mapping
 * Maps industry codes to their names and hierarchy
 */
export const TCBS_INDUSTRY_MAPPING: Record<
  string,
  {
    name: string;
    level: TcbsIndustryLevel;
    parentCode?: string;
  }
> = {
  // Example entries
  '1000': { name: 'Financials', level: TcbsIndustryLevel.SECTOR },
  '1010': {
    name: 'Banks',
    level: TcbsIndustryLevel.INDUSTRY_GROUP,
    parentCode: '1000',
  },
  '1020': {
    name: 'Financial Services',
    level: TcbsIndustryLevel.INDUSTRY_GROUP,
    parentCode: '1000',
  },
  '2000': { name: 'Information Technology', level: TcbsIndustryLevel.SECTOR },
  '2010': {
    name: 'Software & Services',
    level: TcbsIndustryLevel.INDUSTRY_GROUP,
    parentCode: '2000',
  },
  // Additional mappings would be included in the actual implementation
};
```

## Exchange Codes

```typescript
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
```

## Technical Indicator Types

```typescript
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
```

## Screener Constants

```typescript
/**
 * Financial metric field names for screening
 */
export enum TcbsScreenerField {
  /** Price to Earnings ratio */
  PE = 'pe',
  /** Price to Book ratio */
  PB = 'pb',
  /** Price to Sales ratio */
  PS = 'ps',
  /** Earnings per Share */
  EPS = 'eps',
  /** Return on Equity */
  ROE = 'roe',
  /** Return on Assets */
  ROA = 'roa',
  /** Net Profit Margin */
  NPM = 'npm',
  /** Debt to Equity ratio */
  DEBT_TO_EQUITY = 'debtToEquity',
  /** Market Capitalization */
  MARKET_CAP = 'marketCap',
  /** Share Price */
  PRICE = 'price',
  /** Price change percent */
  PRICE_CHANGE_PERCENT = 'priceChangePercent',
  /** Average daily trading volume */
  AVERAGE_VOLUME = 'averageVolume',
}

/**
 * Comparison operators for stock screening
 */
export enum TcbsScreenerOperator {
  /** Equal to */
  EQUAL = 'eq',
  /** Greater than */
  GREATER_THAN = 'gt',
  /** Greater than or equal to */
  GREATER_THAN_OR_EQUAL = 'gte',
  /** Less than */
  LESS_THAN = 'lt',
  /** Less than or equal to */
  LESS_THAN_OR_EQUAL = 'lte',
  /** Between two values (inclusive) */
  BETWEEN = 'between',
  /** In a list of values */
  IN = 'in',
}
```

## Error Codes

```typescript
/**
 * TCBS API error codes and messages
 */
export const TCBS_ERROR_CODES: Record<string, string> = {
  SYMBOL_NOT_FOUND: 'The requested stock symbol was not found',
  INVALID_DATE_RANGE: 'The provided date range is invalid',
  RATE_LIMIT_EXCEEDED: 'API rate limit has been exceeded',
  INVALID_PARAMETER: 'One or more parameters are invalid',
  SERVER_ERROR: 'TCBS server encountered an error',
  SERVICE_UNAVAILABLE: 'TCBS service is currently unavailable',
};
```

## Utility Constants

```typescript
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
```

## Implementation Notes

When implementing these constants in TypeScript:

1. Create a dedicated `const.ts` file in the TCBS explorer directory
2. Export all constants and enums for use in other modules
3. Use TypeScript's enum feature for fixed value sets
4. Use string literal types where appropriate for type safety
5. Document constants with JSDoc comments for better IDE integration

## Usage Example

```typescript
import {
  TCBS_ENDPOINTS,
  TcbsResolution,
  TcbsFinancialPeriod,
  TcbsExchange,
} from './const';

// Fetch historical data
const fetchHistoricalData = async (symbol: string) => {
  const endpoint = TCBS_ENDPOINTS.HISTORICAL(symbol);
  const params = new URLSearchParams({
    from: '2023-01-01',
    to: '2023-04-01',
    resolution: TcbsResolution.DAILY,
  });
  const url = `${endpoint}?${params.toString()}`;
  // Make API call...
};

// Get financial ratios
const getFinancialRatios = async (symbol: string) => {
  const endpoint = TCBS_ENDPOINTS.FINANCIAL_RATIO(symbol);
  const params = new URLSearchParams({
    period: TcbsFinancialPeriod.QUARTERLY,
  });
  const url = `${endpoint}?${params.toString()}`;
  // Make API call...
};

// Filter stocks by exchange
const getStocksByExchange = (stocks, exchange: TcbsExchange) => {
  return stocks.filter((stock) => stock.exchange === exchange);
};
```

## Related Documentation

- [TCBS Explorer Overview](./index.md)
- [TCBS Data Models](./models.md)
- [TCBS Quote Implementation](./quote.md)
