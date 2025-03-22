# MSN Explorer Data Models

**Original Python Implementation**: [models.py](/vnstock/explorer/msn/models.py)


## Overview

This document defines the TypeScript interfaces and data models used throughout the MSN explorer. These data structures represent the API response formats, standardized data transformations, and object types used for retrieving and processing financial data from MSN Money.

## Core Data Interfaces

### Quote Data

The `QuoteData` interface represents current price and trading information for a security:

```typescript
/**
 * Represents price quote data for a security
 */
export interface QuoteData {
  /** Symbol/ticker of the security */
  symbol: string;

  /** Full name of the security */
  name: string;

  /** Exchange where the security is traded */
  exchange: string;

  /** Current price of the security */
  price: number;

  /** Absolute price change from previous close */
  change: number;

  /** Percentage price change from previous close */
  changePercent: number;

  /** Trading volume for the current session */
  volume: number;

  /** Previous day's closing price */
  previousClose: number;

  /** Opening price for the current session */
  open: number;

  /** Highest price during the current session */
  dayHigh: number;

  /** Lowest price during the current session */
  dayLow: number;

  /** Market capitalization (for stocks) */
  marketCap: number;

  /** Price to earnings ratio (for stocks) */
  peRatio: number;

  /** Dividend amount (for dividend-paying stocks) */
  dividend: number;

  /** Dividend yield percentage (for dividend-paying stocks) */
  dividendYield: number;

  /** Currency in which the security is priced */
  currency: string;

  /** Type of security (stock, index, ETF, etc.) */
  assetType: string;

  /** Timestamp when the quote data was last updated */
  lastUpdated: Date;
}
```

### Historical Data

The `HistoricalData` interface represents a collection of OHLC (Open, High, Low, Close) price data points over time:

```typescript
/**
 * Represents a single OHLC price data point
 */
export interface OhlcDataPoint {
  /** Date of this price data point */
  date: Date;

  /** Opening price */
  open: number;

  /** Highest price during the period */
  high: number;

  /** Lowest price during the period */
  low: number;

  /** Closing price */
  close: number;

  /** Trading volume for the period */
  volume: number;

  /** Adjusted close price (accounting for splits and dividends) */
  adjustedClose: number;
}

/**
 * Represents a collection of historical price data
 */
export interface HistoricalData {
  /** Symbol/ticker of the security */
  symbol: string;

  /** Time interval between data points */
  interval: string;

  /** Array of price data points */
  data: OhlcDataPoint[];
}
```

### Search Results

The `SearchResult` interface represents a single security match from a search query:

```typescript
/**
 * Represents a security found in a search query
 */
export interface SearchResult {
  /** Symbol/ticker of the security */
  symbol: string;

  /** Full name of the security */
  name: string;

  /** Exchange where the security is traded */
  exchange: string;

  /** Type of security (stock, index, ETF, etc.) */
  assetType: string;

  /** Market region (e.g., US, Europe, Asia) */
  region: string;

  /** Currency in which the security is priced */
  currency: string;
}
```

### Company Information

The `CompanyInfo` interface represents detailed company information for stocks:

```typescript
/**
 * Represents detailed company information
 */
export interface CompanyInfo {
  /** Symbol/ticker of the company */
  symbol: string;

  /** Full company name */
  name: string;

  /** Exchange where the company is listed */
  exchange: string;

  /** Full company description */
  description: string;

  /** Industry category */
  industry: string;

  /** Sector classification */
  sector: string;

  /** Website URL */
  website: string;

  /** Company CEO name */
  ceo: string;

  /** Company headquarters location */
  address: string;

  /** Number of employees */
  employees: number;

  /** Year the company was founded */
  foundedYear: number;

  /** Company fiscal year end month */
  fiscalYearEnd: string;

  /** Latest reported revenue */
  revenue: number;

  /** Latest reported net income */
  netIncome: number;

  /** Total market capitalization */
  marketCap: number;

  /** Shares outstanding */
  sharesOutstanding: number;

  /** URL to company logo */
  logoUrl: string;

  /** Primary currency used in financial reporting */
  reportingCurrency: string;
}
```

### Market Summary

The `MarketSummary` interface represents an overview of market indices and indicators:

```typescript
/**
 * Represents a market index entry in a market summary
 */
export interface MarketIndexSummary {
  /** Index symbol */
  symbol: string;

  /** Index name */
  name: string;

  /** Current index value */
  value: number;

  /** Absolute change from previous close */
  change: number;

  /** Percentage change from previous close */
  changePercent: number;

  /** Trading volume */
  volume: number;

  /** Previous day's closing value */
  previousClose: number;
}

/**
 * Represents a market summary with multiple indices
 */
export interface MarketSummary {
  /** Major indices for the specified region */
  indices: MarketIndexSummary[];

  /** Market region (e.g., US, Europe, Asia) */
  region: string;

  /** Market trading status (open, closed, pre-market, after-hours) */
  marketStatus: string;

  /** Timestamp of the data */
  timestamp: Date;

  /** Number of advancing stocks */
  advancers?: number;

  /** Number of declining stocks */
  decliners?: number;

  /** Number of unchanged stocks */
  unchanged?: number;

  /** NYSE advance-decline spread */
  advanceDeclineRatio?: number;
}
```

## API Request Parameters

### Quote Request

```typescript
/**
 * Parameters for quote request
 */
export interface QuoteRequestParams {
  /** Symbol to retrieve quote for */
  symbol: string;

  /** Data fields to include */
  fields?: string;

  /** Include extended hours data if available */
  includeExtendedHours?: boolean;
}
```

### Historical Data Request

```typescript
/**
 * Parameters for historical data request
 */
export interface HistoricalRequestParams {
  /** Symbol to retrieve data for */
  symbol: string;

  /** Start date for historical data */
  startDate?: string;

  /** End date for historical data */
  endDate?: string;

  /** Time period shortcut (alternative to start/end dates) */
  period?: string;

  /** Data interval between points */
  interval: string;

  /** Include extended hours data if available */
  includeExtendedHours?: boolean;

  /** Include adjusted prices */
  adjusted?: boolean;
}
```

### Search Request

```typescript
/**
 * Parameters for search request
 */
export interface SearchRequestParams {
  /** Search query term */
  query: string;

  /** Maximum number of results to return */
  limit?: number;

  /** Filter by asset type */
  assetType?: string;

  /** Filter by market region */
  region?: string;
}
```

## API Response Interfaces

These interfaces represent the raw API responses before transformation to standardized formats.

### Raw Quote Response

```typescript
/**
 * Raw quote response from MSN API
 */
export interface RawQuoteResponse {
  /** Security identifier */
  ticker: string;

  /** Security name */
  name: string;

  /** Exchange identifier */
  exchange: string;

  /** Type of security */
  assetType: string;

  /** Current price */
  price: string | number;

  /** Price change */
  change: string | number;

  /** Percentage change */
  changePercent: string | number;

  /** Trading volume */
  volume: string | number;

  /** Timestamp of the data (in ms) */
  time: number;

  /** Previous day's close */
  previousClose: string | number;

  /** Opening price */
  open: string | number;

  /** Day high */
  dayHigh: string | number;

  /** Day low */
  dayLow: string | number;

  /** 52-week high */
  fiftyTwoWeekHigh: string | number;

  /** 52-week low */
  fiftyTwoWeekLow: string | number;

  /** Market capitalization */
  marketCap: string | number;

  /** Price to earnings ratio */
  peRatio: string | number;

  /** Earnings per share */
  eps: string | number;

  /** Currency code */
  currency: string;

  /** Additional quote details for extended data */
  additionalData?: {
    /** Average volume */
    averageVolume: string | number;

    /** Dividend amount */
    dividend: string | number;

    /** Dividend yield */
    dividendYield: string | number;

    /** Dividend payment date */
    dividendDate: string;

    /** Ex-dividend date */
    exDividendDate: string;

    /** Beta value */
    beta: string | number;

    /** Price to book ratio */
    priceToBook: string | number;
  };
}
```

### Raw Historical Response

```typescript
/**
 * Raw historical data response from MSN API
 */
export interface RawHistoricalResponse {
  /** Security identifier */
  ticker: string;

  /** Interval between data points */
  interval: string;

  /** Array of price candles */
  candles: {
    /** Timestamp of data point (in ms) */
    time: number;

    /** Opening price */
    open: string | number;

    /** High price */
    high: string | number;

    /** Low price */
    low: string | number;

    /** Closing price */
    close: string | number;

    /** Trading volume */
    volume: string | number;

    /** Adjusted close price */
    adjclose?: string | number;
  }[];

  /** Currency code */
  currency: string;

  /** Exchange timezone */
  timezone: string;
}
```

### Raw Search Response

```typescript
/**
 * Raw search response from MSN API
 */
export interface RawSearchResponse {
  /** Array of search results */
  results: {
    /** Security identifier */
    ticker: string;

    /** Security name */
    name: string;

    /** Exchange identifier */
    exchange: string;

    /** Type of security */
    assetType: string;

    /** Market region */
    region: string;

    /** Currency code */
    currency: string;
  }[];

  /** Pagination details */
  pagination?: {
    /** Current page number */
    page: number;

    /** Results per page */
    pageSize: number;

    /** Total count of results */
    totalCount: number;
  };
}
```

## Error Interfaces

```typescript
/**
 * MSN API error structure
 */
export interface MsnApiError extends Error {
  /** Error code matching a known error type */
  code: string;

  /** Flag indicating this is an API error */
  isApiError: boolean;

  /** The original error that triggered this one */
  originalError?: Error;
}

/**
 * MSN API validation error
 */
export interface ValidationError extends Error {
  /** The parameter that failed validation */
  param: string;

  /** The validation constraint that failed */
  constraint: string;

  /** The actual value that was invalid */
  value: any;
}
```

## Config and Options Interfaces

```typescript
/**
 * MSN Explorer configuration options
 */
export interface MsnExplorerOptions {
  /** API request timeout in milliseconds */
  timeout?: number;

  /** Whether to retry failed requests */
  retryOnFailure?: boolean;

  /** Maximum number of retry attempts */
  maxRetries?: number;

  /** Locale for formatting and responses */
  locale?: string;

  /** Custom request headers */
  headers?: Record<string, string>;

  /** Whether to cache responses */
  enableCaching?: boolean;

  /** How long to cache responses (in milliseconds) */
  cacheDuration?: number;
}

/**
 * Quote retrieval options
 */
export interface QuoteOptions {
  /** Include extended hours data */
  includeExtendedHours?: boolean;

  /** Fields to include in the response */
  fields?: QuoteFields;

  /** Request timeout override */
  timeout?: number;
}

/**
 * Historical data retrieval options
 */
export interface HistoricalOptions {
  /** Start date for data range */
  startDate?: Date;

  /** End date for data range */
  endDate?: Date;

  /** Predefined period as alternative to date range */
  period?: HistoricalPeriod;

  /** Interval between data points */
  interval?: DataInterval;

  /** Include extended hours data */
  includeExtendedHours?: boolean;

  /** Use adjusted prices */
  adjusted?: boolean;

  /** Request timeout override */
  timeout?: number;
}
```

## Type Aliases

```typescript
/**
 * Type alias for valid time periods
 */
export type Period = HistoricalPeriod | string;

/**
 * Type alias for valid data intervals
 */
export type Interval = DataInterval | string;

/**
 * Type alias for valid asset types
 */
export type Asset = AssetType | string;

/**
 * Type alias for market status
 */
export type MarketStatus =
  | 'open'
  | 'closed'
  | 'pre-market'
  | 'after-hours'
  | 'holiday'
  | 'unknown';
```

## Implementation Notes

When using these data models in TypeScript:

1. Define all interfaces in a dedicated `models.ts` file
2. Export all interfaces and types for use throughout the MSN explorer
3. Use TypeScript's strict mode to enforce type checking
4. Consider using Zod or similar validation libraries for runtime validation
5. Add JSDoc comments for better IDE integration and documentation
6. Implement type guards for type narrowing when needed

The following type guards are particularly useful:

```typescript
/**
 * Type guard for checking if a value is a valid QuoteData
 */
export function isQuoteData(value: any): value is QuoteData {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.symbol === 'string' &&
    typeof value.price === 'number'
  );
}

/**
 * Type guard for checking if a value is a valid HistoricalData
 */
export function isHistoricalData(value: any): value is HistoricalData {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.symbol === 'string' &&
    Array.isArray(value.data)
  );
}

/**
 * Type guard for checking if a value is a valid SearchResult
 */
export function isSearchResult(value: any): value is SearchResult {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.symbol === 'string' &&
    typeof value.name === 'string'
  );
}
```

## Usage Example

```typescript
import {
  QuoteData,
  HistoricalData,
  SearchResult,
  QuoteOptions,
  HistoricalOptions,
} from './models';
import { HistoricalPeriod, DataInterval } from './const';

// Create fully typed request options
const quoteOptions: QuoteOptions = {
  includeExtendedHours: true,
  fields: QuoteFields.ALL,
  timeout: 10000,
};

// Create historical options with proper typing
const historicalOptions: HistoricalOptions = {
  period: HistoricalPeriod.ONE_YEAR,
  interval: DataInterval.ONE_DAY,
  adjusted: true,
};

// Function with proper parameter and return types
async function getQuote(
  symbol: string,
  options?: QuoteOptions
): Promise<QuoteData> {
  // Implementation...
}

// Function with proper type handling
async function getHistoricalData(
  symbol: string,
  options: HistoricalOptions
): Promise<HistoricalData> {
  // Implementation...
}

// Type guard usage
function processData(data: any): void {
  if (isQuoteData(data)) {
    // TypeScript knows data is QuoteData here
    console.log(`Price: ${data.price}`);
  } else if (isHistoricalData(data)) {
    // TypeScript knows data is HistoricalData here
    console.log(`Data points: ${data.data.length}`);
  }
}
```

## Related Documentation

- [MSN Explorer Overview](./index.md)
- [MSN Constants and Configuration](./const.md)
- [MSN Helper Functions](./helper.md)
- [MSN Quote Functions](./quote.md)
- [MSN Listing Functions](./listing.md)
