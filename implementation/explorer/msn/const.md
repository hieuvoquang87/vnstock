# MSN Explorer Constants and Configuration

## Overview

This document details the constants, enums, configuration values, and mappings used in the MSN explorer. These constants serve as reference points for API endpoints, market identifiers, and data formatting throughout the explorer implementation.

## API Endpoints

```typescript
/**
 * Base endpoints for MSN Money API services
 */
export const MSN_API_ENDPOINTS = {
  /** Base URL for the MSN Finance API */
  BASE: 'https://api.msn.com/finance',

  /** Quote endpoint - retrieves current price information */
  QUOTE: 'https://api.msn.com/finance/quote',

  /** Historical data endpoint - retrieves price history */
  HISTORICAL: 'https://api.msn.com/finance/historical',

  /** Search endpoint - finds securities by name or symbol */
  SEARCH: 'https://api.msn.com/finance/search',

  /** Market news endpoint - retrieves financial news */
  NEWS: 'https://api.msn.com/finance/news',

  /** Company info endpoint - retrieves detailed company information */
  COMPANY_INFO: 'https://api.msn.com/finance/company',

  /** Market summary endpoint - retrieves overall market data */
  MARKET_SUMMARY: 'https://api.msn.com/finance/markets/summary',
};
```

## Time Periods for Historical Data

```typescript
/**
 * Time periods for historical data requests
 */
export enum HistoricalPeriod {
  /** One day - intraday data */
  ONE_DAY = '1d',

  /** Five days - typically includes intraday data */
  FIVE_DAYS = '5d',

  /** One month data */
  ONE_MONTH = '1m',

  /** Three months data */
  THREE_MONTHS = '3m',

  /** Six months data */
  SIX_MONTHS = '6m',

  /** Year to date data */
  YEAR_TO_DATE = 'ytd',

  /** One year data */
  ONE_YEAR = '1y',

  /** Two years data */
  TWO_YEARS = '2y',

  /** Five years data */
  FIVE_YEARS = '5y',

  /** Ten years data */
  TEN_YEARS = '10y',

  /** Maximum available data */
  MAX = 'max',
}
```

## Data Intervals

```typescript
/**
 * Intervals for historical data points
 */
export enum DataInterval {
  /** One minute interval - for intraday data */
  ONE_MINUTE = '1m',

  /** Five minute interval - for intraday data */
  FIVE_MINUTES = '5m',

  /** Fifteen minute interval - for intraday data */
  FIFTEEN_MINUTES = '15m',

  /** Thirty minute interval - for intraday data */
  THIRTY_MINUTES = '30m',

  /** One hour interval - for intraday data */
  ONE_HOUR = '1h',

  /** One day interval - for longer periods */
  ONE_DAY = '1d',

  /** One week interval - for longer periods */
  ONE_WEEK = '1wk',

  /** One month interval - for longer periods */
  ONE_MONTH = '1mo',
}
```

## Asset Types

```typescript
/**
 * Asset types for securities in MSN Finance
 */
export enum AssetType {
  /** Individual stocks */
  STOCK = 'stock',

  /** Market indices (e.g., S&P 500, Dow Jones) */
  INDEX = 'index',

  /** Exchange-traded funds */
  ETF = 'etf',

  /** Mutual funds */
  MUTUAL_FUND = 'mutualFund',

  /** Currency pairs */
  CURRENCY = 'currency',

  /** Cryptocurrencies */
  CRYPTOCURRENCY = 'cryptocurrency',

  /** Futures contracts */
  FUTURES = 'futures',

  /** Options contracts */
  OPTIONS = 'options',

  /** Bonds */
  BOND = 'bond',
}
```

## Major Global Markets

```typescript
/**
 * Major global stock markets
 */
export enum GlobalMarket {
  /** United States markets */
  US = 'us',

  /** European markets */
  EUROPE = 'europe',

  /** Asian markets */
  ASIA = 'asia',

  /** United Kingdom markets */
  UK = 'uk',

  /** Japanese markets */
  JAPAN = 'japan',

  /** Chinese markets */
  CHINA = 'china',

  /** Hong Kong markets */
  HONG_KONG = 'hongKong',

  /** Australian markets */
  AUSTRALIA = 'australia',

  /** Canadian markets */
  CANADA = 'canada',

  /** Indian markets */
  INDIA = 'india',

  /** Brazilian markets */
  BRAZIL = 'brazil',
}

/**
 * Mapping of global markets to their display names
 */
export const GLOBAL_MARKET_NAMES: Record<GlobalMarket, string> = {
  [GlobalMarket.US]: 'United States',
  [GlobalMarket.EUROPE]: 'Europe',
  [GlobalMarket.ASIA]: 'Asia',
  [GlobalMarket.UK]: 'United Kingdom',
  [GlobalMarket.JAPAN]: 'Japan',
  [GlobalMarket.CHINA]: 'China',
  [GlobalMarket.HONG_KONG]: 'Hong Kong',
  [GlobalMarket.AUSTRALIA]: 'Australia',
  [GlobalMarket.CANADA]: 'Canada',
  [GlobalMarket.INDIA]: 'India',
  [GlobalMarket.BRAZIL]: 'Brazil',
};
```

## Major Exchanges

```typescript
/**
 * Major stock exchanges
 */
export enum Exchange {
  /** New York Stock Exchange */
  NYSE = 'NYSE',

  /** NASDAQ Stock Exchange */
  NASDAQ = 'NASDAQ',

  /** London Stock Exchange */
  LSE = 'LSE',

  /** Tokyo Stock Exchange */
  TSE = 'TSE',

  /** Hong Kong Stock Exchange */
  HKEX = 'HKEX',

  /** Shanghai Stock Exchange */
  SSE = 'SSE',

  /** Shenzhen Stock Exchange */
  SZSE = 'SZSE',

  /** Toronto Stock Exchange */
  TSX = 'TSX',

  /** Euronext */
  EURONEXT = 'EURONEXT',

  /** Deutsche Börse */
  DB = 'DB',

  /** Bombay Stock Exchange */
  BSE = 'BSE',

  /** National Stock Exchange of India */
  NSE = 'NSE',

  /** Korea Exchange */
  KRX = 'KRX',

  /** Australian Securities Exchange */
  ASX = 'ASX',

  /** Singapore Exchange */
  SGX = 'SGX',
}
```

## Major Global Indices

```typescript
/**
 * Major global stock indices
 */
export const GLOBAL_INDICES = {
  /** S&P 500 Index (US) */
  SP500: '.INX',

  /** Dow Jones Industrial Average (US) */
  DOW: '.DJI',

  /** NASDAQ Composite (US) */
  NASDAQ: '.IXIC',

  /** FTSE 100 (UK) */
  FTSE: '.FTSE',

  /** DAX Index (Germany) */
  DAX: '.GDAXI',

  /** CAC 40 (France) */
  CAC: '.FCHI',

  /** Nikkei 225 (Japan) */
  NIKKEI: '.N225',

  /** Hang Seng Index (Hong Kong) */
  HANG_SENG: '.HSI',

  /** Shanghai Composite (China) */
  SHANGHAI: '.SSEC',

  /** ASX 200 (Australia) */
  ASX200: '.AXJO',

  /** S&P/TSX Composite (Canada) */
  TSX: '.GSPTSE',

  /** Sensex (India) */
  SENSEX: '.BSESN',

  /** Bovespa (Brazil) */
  BOVESPA: '.BVSP',
};
```

## Quote Data Fields

```typescript
/**
 * Available data fields for quote requests
 */
export enum QuoteFields {
  /** Basic quote data including price, change, volume */
  BASIC = 'basic',

  /** Extended data including market cap, PE ratio, etc. */
  EXTENDED = 'extended',

  /** All available data fields */
  ALL = 'all',
}
```

## Currency Formatting

```typescript
/**
 * Currency code mapping for formatting
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  HKD: 'HK$',
  AUD: 'A$',
  CAD: 'C$',
  INR: '₹',
  BRL: 'R$',
  KRW: '₩',
  SGD: 'S$',
  VND: '₫',
};
```

## Error Codes

```typescript
/**
 * MSN API error codes and messages
 */
export const MSN_ERROR_CODES: Record<string, string> = {
  INVALID_SYMBOL: 'The provided symbol is invalid',
  INVALID_PERIOD: 'The provided time period is invalid',
  INVALID_INTERVAL: 'The provided data interval is invalid',
  RATE_LIMIT_EXCEEDED: 'API rate limit has been exceeded',
  SERVICE_UNAVAILABLE: 'MSN Finance service is currently unavailable',
  NOT_FOUND: 'The requested resource was not found',
  GENERAL_ERROR: 'An error occurred while processing the request',
};
```

## Request Headers

```typescript
/**
 * Required headers for MSN API requests
 */
export const MSN_REQUEST_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  Referer: 'https://www.msn.com/en-us/money',
  Origin: 'https://www.msn.com',
};
```

## Utility Constants

```typescript
/**
 * Default request timeout in milliseconds
 */
export const MSN_DEFAULT_TIMEOUT = 30000;

/**
 * Default number of results per page for search queries
 */
export const MSN_DEFAULT_SEARCH_LIMIT = 10;

/**
 * Default locale for formatting and regional settings
 */
export const MSN_DEFAULT_LOCALE = 'en-US';

/**
 * Default timezone for date/time conversions (UTC)
 */
export const MSN_DEFAULT_TIMEZONE = 'UTC';
```

## Implementation Notes

When implementing these constants in TypeScript:

1. Create a dedicated `const.ts` file in the MSN explorer directory
2. Export all constants and enums for use in other modules
3. Use TypeScript's enum feature for fixed value sets
4. Use type unions where appropriate for more flexibility
5. Ensure all constant values are documented with JSDoc comments

## Usage Example

```typescript
import {
  MSN_API_ENDPOINTS,
  HistoricalPeriod,
  DataInterval,
  GLOBAL_INDICES,
  MSN_REQUEST_HEADERS,
} from './const';

// Get quote for a stock
const getQuote = async (symbol: string) => {
  const url = MSN_API_ENDPOINTS.QUOTE;
  const headers = { ...MSN_REQUEST_HEADERS };

  // API call implementation...
};

// Get historical data for S&P 500
const getSpHistoricalData = async () => {
  const symbol = GLOBAL_INDICES.SP500;
  const url = MSN_API_ENDPOINTS.HISTORICAL;
  const params = {
    period: HistoricalPeriod.ONE_YEAR,
    interval: DataInterval.ONE_DAY,
  };

  // API call implementation...
};
```

## Related Documentation

- [MSN Explorer Overview](./index.md)
- [MSN Helper Functions](./helper.md)
- [MSN Quote Functions](./quote.md)
