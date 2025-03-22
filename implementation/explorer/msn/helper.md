# MSN Explorer Helper Functions

**Original Python Implementation**: [helper.py](/vnstock/explorer/msn/helper.py)


## Overview

This document details the helper functions used in the MSN explorer for data processing, transformations, validations, and other supporting tasks. These functions help standardize data formats, handle international data specifications, and ensure proper processing of the MSN Money API responses.

## Symbol Formatting Functions

```typescript
/**
 * Formats a symbol for use with MSN Finance API
 * Ensures correct format for different asset types
 *
 * @param symbol - The raw symbol to format
 * @param assetType - Optional asset type for specific formatting rules
 * @returns Properly formatted symbol
 */
export function formatSymbol(symbol: string, assetType?: AssetType): string {
  // Remove any whitespace
  let formattedSymbol = symbol.trim();

  // Handle index symbols - ensure they start with a dot
  if (assetType === AssetType.INDEX && !formattedSymbol.startsWith('.')) {
    formattedSymbol = `.${formattedSymbol}`;
  }

  // Handle currency pairs - ensure proper format (e.g., "USD/EUR")
  if (assetType === AssetType.CURRENCY && !formattedSymbol.includes('/')) {
    // If it's in the format "USDEUR", convert to "USD/EUR"
    if (formattedSymbol.length === 6) {
      formattedSymbol = `${formattedSymbol.substring(
        0,
        3
      )}/${formattedSymbol.substring(3)}`;
    }
  }

  return formattedSymbol;
}

/**
 * Parses a symbol to determine its likely asset type
 *
 * @param symbol - The symbol to analyze
 * @returns The likely asset type
 */
export function detectAssetType(symbol: string): AssetType {
  // Remove any whitespace
  const cleanSymbol = symbol.trim();

  // Index symbols typically start with a dot
  if (cleanSymbol.startsWith('.')) {
    return AssetType.INDEX;
  }

  // Currency pairs contain a slash
  if (cleanSymbol.includes('/')) {
    return AssetType.CURRENCY;
  }

  // Cryptocurrency symbols often have specific prefixes or patterns
  if (
    cleanSymbol.startsWith('CRYPTO:') ||
    cleanSymbol.toUpperCase().includes('BTC') ||
    cleanSymbol.toUpperCase().includes('ETH')
  ) {
    return AssetType.CRYPTOCURRENCY;
  }

  // ETFs typically end with specific suffixes
  if (
    cleanSymbol.endsWith('ETF') ||
    cleanSymbol.includes('-ETF') ||
    cleanSymbol.includes('.ETF')
  ) {
    return AssetType.ETF;
  }

  // Default to stock for most common case
  return AssetType.STOCK;
}

/**
 * Normalizes exchange identifiers to a standard format
 *
 * @param exchange - The exchange identifier from MSN
 * @returns Standardized exchange identifier
 */
export function normalizeExchange(exchange: string): Exchange | string {
  // Uppercase for consistency
  const upperExchange = exchange.toUpperCase();

  // Map common variations to standard exchange enum values
  const exchangeMap: Record<string, Exchange> = {
    NYSE: Exchange.NYSE,
    'NEW YORK STOCK EXCHANGE': Exchange.NYSE,
    NASDAQ: Exchange.NASDAQ,
    'NASDAQ STOCK MARKET': Exchange.NASDAQ,
    LSE: Exchange.LSE,
    'LONDON STOCK EXCHANGE': Exchange.LSE,
    TSE: Exchange.TSE,
    'TOKYO STOCK EXCHANGE': Exchange.TSE,
    HKEX: Exchange.HKEX,
    'HONG KONG STOCK EXCHANGE': Exchange.HKEX,
    SSE: Exchange.SSE,
    'SHANGHAI STOCK EXCHANGE': Exchange.SSE,
    SZSE: Exchange.SZSE,
    'SHENZHEN STOCK EXCHANGE': Exchange.SZSE,
    TSX: Exchange.TSX,
    'TORONTO STOCK EXCHANGE': Exchange.TSX,
    EURONEXT: Exchange.EURONEXT,
    DB: Exchange.DB,
    'DEUTSCHE BOERSE': Exchange.DB,
    BSE: Exchange.BSE,
    'BOMBAY STOCK EXCHANGE': Exchange.BSE,
    NSE: Exchange.NSE,
    'NATIONAL STOCK EXCHANGE OF INDIA': Exchange.NSE,
    KRX: Exchange.KRX,
    'KOREA EXCHANGE': Exchange.KRX,
    ASX: Exchange.ASX,
    'AUSTRALIAN SECURITIES EXCHANGE': Exchange.ASX,
    SGX: Exchange.SGX,
    'SINGAPORE EXCHANGE': Exchange.SGX,
  };

  return exchangeMap[upperExchange] || upperExchange;
}
```

## Data Transformation Functions

```typescript
/**
 * Transforms MSN quote data to a standardized format
 *
 * @param rawData - Raw quote data from MSN API
 * @returns Standardized quote data
 */
export function transformQuoteData(rawData: any): QuoteData {
  // Extract necessary fields and standardize the format
  return {
    symbol: rawData.ticker || '',
    name: rawData.name || '',
    exchange: normalizeExchange(rawData.exchange || ''),
    price: Number(rawData.price) || 0,
    change: Number(rawData.change) || 0,
    changePercent: Number(rawData.changePercent) || 0,
    volume: Number(rawData.volume) || 0,
    previousClose: Number(rawData.previousClose) || 0,
    open: Number(rawData.open) || 0,
    dayHigh: Number(rawData.dayHigh) || 0,
    dayLow: Number(rawData.dayLow) || 0,
    marketCap: Number(rawData.marketCap) || 0,
    peRatio: Number(rawData.peRatio) || 0,
    dividend: Number(rawData.dividend) || 0,
    dividendYield: Number(rawData.dividendYield) || 0,
    currency: rawData.currency || 'USD',
    assetType: rawData.assetType || detectAssetType(rawData.ticker || ''),
    lastUpdated: new Date(rawData.time || Date.now()),
  };
}

/**
 * Transforms MSN historical data to a standardized format
 *
 * @param rawData - Raw historical data from MSN API
 * @param interval - The data interval used
 * @returns Standardized historical data
 */
export function transformHistoricalData(
  rawData: any,
  interval: DataInterval
): HistoricalData {
  // Validate the data
  if (!rawData || !Array.isArray(rawData.candles)) {
    return {
      symbol: rawData?.ticker || '',
      interval,
      data: [],
    };
  }

  // Extract and transform candlestick data
  const candles = rawData.candles.map((candle: any) => ({
    date: new Date(candle.time || Date.now()),
    open: Number(candle.open) || 0,
    high: Number(candle.high) || 0,
    low: Number(candle.low) || 0,
    close: Number(candle.close) || 0,
    volume: Number(candle.volume) || 0,
    adjustedClose: Number(candle.adjclose) || Number(candle.close) || 0,
  }));

  return {
    symbol: rawData.ticker || '',
    interval,
    data: candles,
  };
}

/**
 * Transforms MSN search results to a standardized format
 *
 * @param rawData - Raw search results from MSN API
 * @returns Standardized search results
 */
export function transformSearchResults(rawData: any): SearchResult[] {
  // Validate the data
  if (!rawData || !Array.isArray(rawData.results)) {
    return [];
  }

  // Extract and transform search results
  return rawData.results.map((result: any) => ({
    symbol: result.ticker || '',
    name: result.name || '',
    exchange: normalizeExchange(result.exchange || ''),
    assetType: result.assetType || detectAssetType(result.ticker || ''),
    region: result.region || '',
    currency: result.currency || 'USD',
  }));
}
```

## Data Validation Functions

```typescript
/**
 * Validates a symbol string
 *
 * @param symbol - The symbol to validate
 * @returns Whether the symbol is valid
 */
export function isValidSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }

  // Remove whitespace
  const trimmedSymbol = symbol.trim();

  // Must have at least one character
  if (trimmedSymbol.length === 0) {
    return false;
  }

  // For currency pairs, ensure proper format
  if (trimmedSymbol.includes('/')) {
    const parts = trimmedSymbol.split('/');
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Validates a historical period enum value
 *
 * @param period - The period to validate
 * @returns Whether the period is valid
 */
export function isValidPeriod(period: string): boolean {
  const validPeriods = Object.values(HistoricalPeriod);
  return validPeriods.includes(period as HistoricalPeriod);
}

/**
 * Validates a data interval enum value
 *
 * @param interval - The interval to validate
 * @returns Whether the interval is valid
 */
export function isValidInterval(interval: string): boolean {
  const validIntervals = Object.values(DataInterval);
  return validIntervals.includes(interval as DataInterval);
}
```

## Date and Time Handling

```typescript
/**
 * Formats a date for use with MSN Finance API
 *
 * @param date - The date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Calculates the start date based on a period
 *
 * @param period - The historical period
 * @returns The calculated start date
 */
export function getStartDateFromPeriod(period: HistoricalPeriod): Date {
  const now = new Date();

  switch (period) {
    case HistoricalPeriod.ONE_DAY:
      // 24 hours ago
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);

    case HistoricalPeriod.FIVE_DAYS:
      // 5 days ago
      return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    case HistoricalPeriod.ONE_MONTH:
      // 1 month ago
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    case HistoricalPeriod.THREE_MONTHS:
      // 3 months ago
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    case HistoricalPeriod.SIX_MONTHS:
      // 6 months ago
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    case HistoricalPeriod.YEAR_TO_DATE:
      // January 1st of current year
      return new Date(now.getFullYear(), 0, 1);

    case HistoricalPeriod.ONE_YEAR:
      // 1 year ago
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    case HistoricalPeriod.TWO_YEARS:
      // 2 years ago
      return new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

    case HistoricalPeriod.FIVE_YEARS:
      // 5 years ago
      return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

    case HistoricalPeriod.TEN_YEARS:
      // 10 years ago
      return new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());

    case HistoricalPeriod.MAX:
      // Default to 20 years ago for "max"
      return new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());

    default:
      // Default to 1 year ago
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}
```

## Currency Formatting

```typescript
/**
 * Formats a number as currency
 *
 * @param amount - The amount to format
 * @param currencyCode - The currency code (e.g., "USD")
 * @param locale - The locale for formatting (defaults to en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = MSN_DEFAULT_LOCALE
): string {
  // For very large numbers, convert to millions/billions for readability
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B ${currencyCode}`;
  } else if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M ${currencyCode}`;
  }

  // For normal numbers, use standard currency formatting
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback if Intl is not supported or currency code is invalid
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  }
}
```

## Error Handling

```typescript
/**
 * Creates a standardized error object for MSN API errors
 *
 * @param code - The error code
 * @param message - Optional custom message
 * @param originalError - Optional original error that caused this error
 * @returns Standardized error object
 */
export function createMsnApiError(
  code: keyof typeof MSN_ERROR_CODES,
  message?: string,
  originalError?: Error
): Error {
  const errorMessage = message || MSN_ERROR_CODES[code] || 'Unknown error';
  const error = new Error(`MSN API Error [${code}]: ${errorMessage}`);

  // Add properties to the error object
  Object.defineProperties(error, {
    code: { value: code },
    isApiError: { value: true },
    originalError: { value: originalError },
  });

  return error;
}

/**
 * Checks if an error is an MSN API error
 *
 * @param error - The error to check
 * @returns Whether the error is an MSN API error
 */
export function isMsnApiError(error: any): boolean {
  return error && error.isApiError === true;
}
```

## Request Parameter Handling

```typescript
/**
 * Builds query parameters for MSN API requests
 *
 * @param params - Object containing parameter key-value pairs
 * @returns URL query string (without leading '?')
 */
export function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      // Handle arrays by joining with commas
      if (Array.isArray(value)) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          value.join(',')
        )}`;
      }

      // Handle dates by formatting them
      if (value instanceof Date) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          formatDateForApi(value)
        )}`;
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
}

/**
 * Creates request parameters for historical data
 *
 * @param symbol - The stock symbol
 * @param period - The time period
 * @param interval - The data interval
 * @returns Parameter object for the request
 */
export function createHistoricalDataParams(
  symbol: string,
  period: HistoricalPeriod,
  interval: DataInterval
): Record<string, any> {
  // Format symbol
  const formattedSymbol = formatSymbol(symbol);

  // Calculate dates based on period
  const endDate = new Date();
  const startDate = getStartDateFromPeriod(period);

  return {
    symbol: formattedSymbol,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    interval,
  };
}
```

## Usage Example

```typescript
import {
  formatSymbol,
  detectAssetType,
  transformQuoteData,
  isValidSymbol,
  formatCurrency,
  createHistoricalDataParams,
} from './helper';
import { AssetType, DataInterval, HistoricalPeriod } from './const';

// Format a symbol for API request
const formattedSymbol = formatSymbol('AAPL', AssetType.STOCK);

// Detect asset type from symbol
const assetType = detectAssetType('.INX');
console.log(assetType); // AssetType.INDEX

// Validate user input
if (isValidSymbol(userInputSymbol)) {
  // Proceed with API request
}

// Format currency values
const formattedPrice = formatCurrency(1234567.89, 'USD');
console.log(formattedPrice); // "$1,234,567.89"

// Create parameters for historical data request
const params = createHistoricalDataParams(
  'MSFT',
  HistoricalPeriod.ONE_YEAR,
  DataInterval.ONE_DAY
);

// Transform raw API data to standardized format
const quoteData = transformQuoteData(rawApiResponse);
```

## Implementation Notes

1. **Error Handling**: Implement comprehensive error handling for all helper functions
2. **Type Safety**: Use TypeScript interfaces and type guards for better type safety
3. **Input Validation**: Validate all inputs before processing to prevent issues
4. **Internationalization**: Handle different locales and currencies properly
5. **Performance**: Optimize data transformation functions for large datasets
6. **Testing**: Create unit tests for all helper functions, especially data transformations

## Related Documentation

- [MSN Explorer Overview](./index.md)
- [MSN Constants and Configuration](./const.md)
- [MSN Data Models](./models.md)
- [MSN Quote Functions](./quote.md)
