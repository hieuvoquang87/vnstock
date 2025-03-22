# MSN Explorer Quote Functionality

**Original Python Implementation**: [quote.py](/vnstock/explorer/msn/quote.py)


## Overview

This document details the quote functionality in the MSN explorer module of the vnstock TypeScript library. The quote functions provide access to real-time and historical price data for stocks and other securities from MSN Money, with a focus on international markets.

## Purpose

The MSN Explorer quote functionality enables users to:

1. Retrieve real-time price quotes for any security across global markets
2. Access historical price data with various time intervals and periods
3. Track price movements and calculate performance metrics
4. Compare multiple securities over time
5. Access extended trading hours data (pre-market and after-hours)

## API Endpoints

The quote functionality utilizes the following MSN API endpoints:

| Endpoint          | Purpose              | Description                                               |
| ----------------- | -------------------- | --------------------------------------------------------- |
| `/api/quotes`     | Real-time quotes     | Gets current price and trading information for securities |
| `/api/historical` | Historical data      | Gets OHLC price history for securities                    |
| `/api/extended`   | Extended hours       | Gets pre-market and after-hours trading data              |
| `/api/details`    | Security details     | Gets additional information about a security              |
| `/api/indicators` | Technical indicators | Gets calculated technical indicators for a security       |

## Data Structures

The quote functionality uses the following data structures:

```typescript
/**
 * Quote data for a security
 */
interface QuoteData {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  marketCap: number;
  peRatio: number;
  dividend: number;
  dividendYield: number;
  currency: string;
  assetType: string;
  lastUpdated: Date;
}

/**
 * Historical data point (OHLC)
 */
interface OhlcDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

/**
 * Historical data collection
 */
interface HistoricalData {
  symbol: string;
  interval: string;
  data: OhlcDataPoint[];
}

/**
 * Extended hours data
 */
interface ExtendedHoursData {
  symbol: string;
  preMarket?: {
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    timestamp: Date;
  };
  afterHours?: {
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    timestamp: Date;
  };
  regularMarketClose: number;
}

/**
 * Technical indicator data
 */
interface IndicatorData {
  symbol: string;
  indicators: {
    [key: string]: number | number[];
  };
  lastUpdated: Date;
}

/**
 * Quote request options
 */
interface QuoteOptions {
  includeExtendedHours?: boolean;
  fields?: QuoteFields;
  timeout?: number;
}

/**
 * Historical data request options
 */
interface HistoricalDataOptions {
  startDate?: Date;
  endDate?: Date;
  period?: HistoricalPeriod;
  interval?: DataInterval;
  includeExtendedHours?: boolean;
  adjusted?: boolean;
  timeout?: number;
}
```

## Implementation

The MSN quote functionality is implemented through the `MsnExplorer` class, which provides methods for retrieving quote and historical data:

```typescript
/**
 * MSN Explorer implementation for quote functionality
 */
export class MsnExplorer {
  private readonly httpClient: HttpClient;
  private readonly baseUrl: string;
  private readonly options: MsnExplorerOptions;

  /**
   * Constructor for MsnExplorer
   * @param options - Configuration options
   */
  constructor(options?: MsnExplorerOptions) {
    this.options = {
      timeout: 30000,
      retryOnFailure: true,
      maxRetries: 3,
      locale: 'en-US',
      enableCaching: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      ...options,
    };

    this.baseUrl = MSN_API_ENDPOINTS.BASE_URL;
    this.httpClient = new HttpClient(this.options);
  }

  /**
   * Get real-time quote for a security
   * @param symbol - Security symbol
   * @param options - Quote options
   * @returns Promise resolving to quote data
   */
  async getQuote(symbol: string, options?: QuoteOptions): Promise<QuoteData> {
    if (!symbol || symbol.trim().length === 0) {
      throw new ValidationError({
        param: 'symbol',
        constraint: 'required',
        value: symbol,
      });
    }

    symbol = formatSymbol(symbol);

    const params = {
      symbols: symbol,
      fields: options?.fields || QuoteFields.ALL,
      includeExtendedHours: options?.includeExtendedHours || false,
    };

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.QUOTES}`,
        {
          params,
          timeout: options?.timeout || this.options.timeout,
        }
      );

      const quoteData = response.data?.quotes?.[0];
      if (!quoteData) {
        throw new Error(`No quote data found for symbol: ${symbol}`);
      }

      return this.transformQuoteData(quoteData);
    } catch (error) {
      throw createMsnApiError('QUOTE_ERROR', error);
    }
  }

  /**
   * Get quotes for multiple securities
   * @param symbols - Array of security symbols
   * @param options - Quote options
   * @returns Promise resolving to array of quote data
   */
  async getQuotes(
    symbols: string[],
    options?: QuoteOptions
  ): Promise<QuoteData[]> {
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      throw new ValidationError({
        param: 'symbols',
        constraint: 'required',
        value: symbols,
      });
    }

    const formattedSymbols = symbols.map(formatSymbol).join(',');

    const params = {
      symbols: formattedSymbols,
      fields: options?.fields || QuoteFields.ALL,
      includeExtendedHours: options?.includeExtendedHours || false,
    };

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.QUOTES}`,
        {
          params,
          timeout: options?.timeout || this.options.timeout,
        }
      );

      if (!response.data?.quotes || !Array.isArray(response.data.quotes)) {
        return [];
      }

      return response.data.quotes.map((item: any) =>
        this.transformQuoteData(item)
      );
    } catch (error) {
      throw createMsnApiError('QUOTES_ERROR', error);
    }
  }

  /**
   * Get historical price data for a security
   * @param symbol - Security symbol
   * @param options - Historical data options
   * @returns Promise resolving to historical data
   */
  async getHistoricalData(
    symbol: string,
    options: HistoricalDataOptions
  ): Promise<HistoricalData> {
    if (!symbol || symbol.trim().length === 0) {
      throw new ValidationError({
        param: 'symbol',
        constraint: 'required',
        value: symbol,
      });
    }

    symbol = formatSymbol(symbol);

    // Default to 1 year of daily data if no options provided
    const period = options.period || HistoricalPeriod.ONE_YEAR;
    const interval = options.interval || DataInterval.ONE_DAY;

    const params = createHistoricalDataParams({
      symbol,
      startDate: options.startDate,
      endDate: options.endDate,
      period,
      interval,
      includeExtendedHours: options.includeExtendedHours || false,
      adjusted: options.adjusted !== false, // Default to true
    });

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.HISTORICAL}`,
        {
          params,
          timeout: options.timeout || this.options.timeout,
        }
      );

      return this.transformHistoricalData(response.data, symbol, interval);
    } catch (error) {
      throw createMsnApiError('HISTORICAL_DATA_ERROR', error);
    }
  }

  /**
   * Get extended hours data for a security
   * @param symbol - Security symbol
   * @returns Promise resolving to extended hours data
   */
  async getExtendedHoursData(symbol: string): Promise<ExtendedHoursData> {
    if (!symbol || symbol.trim().length === 0) {
      throw new ValidationError({
        param: 'symbol',
        constraint: 'required',
        value: symbol,
      });
    }

    symbol = formatSymbol(symbol);

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.EXTENDED}`,
        { params: { symbol } }
      );

      return this.transformExtendedHoursData(response.data, symbol);
    } catch (error) {
      throw createMsnApiError('EXTENDED_HOURS_ERROR', error);
    }
  }

  /**
   * Get technical indicators for a security
   * @param symbol - Security symbol
   * @param indicators - Array of indicator names to retrieve
   * @returns Promise resolving to indicator data
   */
  async getIndicators(
    symbol: string,
    indicators: string[]
  ): Promise<IndicatorData> {
    if (!symbol || symbol.trim().length === 0) {
      throw new ValidationError({
        param: 'symbol',
        constraint: 'required',
        value: symbol,
      });
    }

    if (!indicators || !Array.isArray(indicators) || indicators.length === 0) {
      throw new ValidationError({
        param: 'indicators',
        constraint: 'required',
        value: indicators,
      });
    }

    symbol = formatSymbol(symbol);

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.INDICATORS}`,
        { params: { symbol, indicators: indicators.join(',') } }
      );

      return this.transformIndicatorData(response.data, symbol);
    } catch (error) {
      throw createMsnApiError('INDICATORS_ERROR', error);
    }
  }

  /**
   * Transform raw quote data to standardized format
   * @param rawData - Raw API response
   * @returns Transformed quote data
   */
  private transformQuoteData(rawData: any): QuoteData {
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Invalid quote data format');
    }

    return {
      symbol: rawData.ticker || '',
      name: rawData.name || '',
      exchange: rawData.exchange || '',
      price: parseFloat(rawData.price) || 0,
      change: parseFloat(rawData.change) || 0,
      changePercent: parseFloat(rawData.changePercent) || 0,
      volume: parseInt(rawData.volume, 10) || 0,
      previousClose: parseFloat(rawData.previousClose) || 0,
      open: parseFloat(rawData.open) || 0,
      dayHigh: parseFloat(rawData.dayHigh) || 0,
      dayLow: parseFloat(rawData.dayLow) || 0,
      marketCap: parseFloat(rawData.marketCap) || 0,
      peRatio: parseFloat(rawData.peRatio) || 0,
      dividend: parseFloat(rawData.dividend) || 0,
      dividendYield: parseFloat(rawData.dividendYield) || 0,
      currency: rawData.currency || 'USD',
      assetType: rawData.assetType || '',
      lastUpdated: new Date(rawData.time || Date.now()),
    };
  }

  /**
   * Transform raw historical data to standardized format
   * @param rawData - Raw API response
   * @param symbol - Security symbol
   * @param interval - Data interval
   * @returns Transformed historical data
   */
  private transformHistoricalData(
    rawData: any,
    symbol: string,
    interval: string
  ): HistoricalData {
    if (!rawData || !rawData.candles || !Array.isArray(rawData.candles)) {
      return { symbol, interval, data: [] };
    }

    const data = rawData.candles.map((candle: any) => ({
      date: new Date(candle.time || 0),
      open: parseFloat(candle.open) || 0,
      high: parseFloat(candle.high) || 0,
      low: parseFloat(candle.low) || 0,
      close: parseFloat(candle.close) || 0,
      volume: parseInt(candle.volume, 10) || 0,
      adjustedClose:
        parseFloat(candle.adjclose) || parseFloat(candle.close) || 0,
    }));

    return { symbol, interval, data };
  }

  /**
   * Transform raw extended hours data
   * @param rawData - Raw API response
   * @param symbol - Security symbol
   * @returns Transformed extended hours data
   */
  private transformExtendedHoursData(
    rawData: any,
    symbol: string
  ): ExtendedHoursData {
    const result: ExtendedHoursData = {
      symbol,
      regularMarketClose: parseFloat(rawData.regularMarketClose) || 0,
    };

    if (rawData.preMarket) {
      result.preMarket = {
        price: parseFloat(rawData.preMarket.price) || 0,
        change: parseFloat(rawData.preMarket.change) || 0,
        changePercent: parseFloat(rawData.preMarket.changePercent) || 0,
        volume: parseInt(rawData.preMarket.volume, 10) || 0,
        timestamp: new Date(rawData.preMarket.timestamp || Date.now()),
      };
    }

    if (rawData.afterHours) {
      result.afterHours = {
        price: parseFloat(rawData.afterHours.price) || 0,
        change: parseFloat(rawData.afterHours.change) || 0,
        changePercent: parseFloat(rawData.afterHours.changePercent) || 0,
        volume: parseInt(rawData.afterHours.volume, 10) || 0,
        timestamp: new Date(rawData.afterHours.timestamp || Date.now()),
      };
    }

    return result;
  }

  /**
   * Transform raw indicator data
   * @param rawData - Raw API response
   * @param symbol - Security symbol
   * @returns Transformed indicator data
   */
  private transformIndicatorData(rawData: any, symbol: string): IndicatorData {
    if (!rawData || typeof rawData !== 'object') {
      return {
        symbol,
        indicators: {},
        lastUpdated: new Date(),
      };
    }

    const indicators: Record<string, number | number[]> = {};

    // Process each indicator in the response
    Object.keys(rawData).forEach((key) => {
      if (key === 'timestamp') return;

      const value = rawData[key];

      if (Array.isArray(value)) {
        // Handle array indicators like moving averages
        indicators[key] = value.map((v) => parseFloat(v) || 0);
      } else if (typeof value === 'object') {
        // Handle object indicators like MACD with multiple values
        Object.keys(value).forEach((subKey) => {
          indicators[`${key}_${subKey}`] = parseFloat(value[subKey]) || 0;
        });
      } else {
        // Handle simple numeric indicators
        indicators[key] = parseFloat(value) || 0;
      }
    });

    return {
      symbol,
      indicators,
      lastUpdated: new Date(rawData.timestamp || Date.now()),
    };
  }
}
```

## Usage Examples

### Basic Example: Getting a Stock Quote

```typescript
import { MsnExplorer } from 'vnstock';

async function getStockQuote() {
  const msn = new MsnExplorer();

  // Get a quote for Apple stock
  const appleQuote = await msn.getQuote('AAPL');

  console.log(`${appleQuote.symbol} (${appleQuote.name})`);
  console.log(`Price: ${appleQuote.price} ${appleQuote.currency}`);
  console.log(
    `Change: ${appleQuote.change} (${appleQuote.changePercent.toFixed(2)}%)`
  );
  console.log(`Volume: ${appleQuote.volume.toLocaleString()}`);
  console.log(
    `Market Cap: $${(appleQuote.marketCap / 1000000000).toFixed(2)}B`
  );
  console.log(`P/E Ratio: ${appleQuote.peRatio}`);
  console.log(`Dividend Yield: ${appleQuote.dividendYield.toFixed(2)}%`);
  console.log(`Last Updated: ${appleQuote.lastUpdated.toLocaleString()}`);
}

getStockQuote().catch(console.error);
```

### Getting Multiple Quotes

```typescript
import { MsnExplorer } from 'vnstock';

async function getMultipleQuotes() {
  const msn = new MsnExplorer();

  // Get quotes for multiple tech stocks
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  const quotes = await msn.getQuotes(symbols);

  // Create a table of quotes
  console.table(
    quotes.map((quote) => ({
      Symbol: quote.symbol,
      Name: quote.name,
      Price: `${quote.price} ${quote.currency}`,
      Change: `${quote.change} (${quote.changePercent.toFixed(2)}%)`,
      Volume: quote.volume.toLocaleString(),
    }))
  );

  // Calculate total market cap
  const totalMarketCap = quotes.reduce(
    (sum, quote) => sum + quote.marketCap,
    0
  );
  console.log(
    `Total Market Cap: $${(totalMarketCap / 1000000000).toFixed(2)}B`
  );
}

getMultipleQuotes().catch(console.error);
```

### Getting Historical Data

```typescript
import { MsnExplorer, HistoricalPeriod, DataInterval } from 'vnstock';

async function getHistoricalData() {
  const msn = new MsnExplorer();

  // Get 1 year of daily data for Microsoft
  const msftHistory = await msn.getHistoricalData('MSFT', {
    period: HistoricalPeriod.ONE_YEAR,
    interval: DataInterval.ONE_DAY,
    adjusted: true,
  });

  console.log(
    `Retrieved ${msftHistory.data.length} data points for ${msftHistory.symbol}`
  );

  // Calculate some statistics
  const prices = msftHistory.data.map((point) => point.close);
  const latestPrice = prices[prices.length - 1];
  const oldestPrice = prices[0];
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);
  const percentChange = ((latestPrice - oldestPrice) / oldestPrice) * 100;

  console.log(`Starting Price: $${oldestPrice.toFixed(2)}`);
  console.log(`Latest Price: $${latestPrice.toFixed(2)}`);
  console.log(`Overall Change: ${percentChange.toFixed(2)}%`);
  console.log(`Highest: $${highestPrice.toFixed(2)}`);
  console.log(`Lowest: $${lowestPrice.toFixed(2)}`);
  console.log(`Range: $${(highestPrice - lowestPrice).toFixed(2)}`);
}

getHistoricalData().catch(console.error);
```

### Getting Extended Hours Data

```typescript
import { MsnExplorer } from 'vnstock';

async function getExtendedHoursData() {
  const msn = new MsnExplorer();

  // Get extended hours data for Tesla
  const tslaExtended = await msn.getExtendedHoursData('TSLA');

  console.log(`${tslaExtended.symbol} Extended Hours Data:`);
  console.log(
    `Regular Market Close: $${tslaExtended.regularMarketClose.toFixed(2)}`
  );

  if (tslaExtended.preMarket) {
    console.log('Pre-Market:');
    console.log(`  Price: $${tslaExtended.preMarket.price.toFixed(2)}`);
    console.log(
      `  Change: ${tslaExtended.preMarket.change.toFixed(
        2
      )} (${tslaExtended.preMarket.changePercent.toFixed(2)}%)`
    );
    console.log(`  Volume: ${tslaExtended.preMarket.volume.toLocaleString()}`);
    console.log(
      `  Time: ${tslaExtended.preMarket.timestamp.toLocaleTimeString()}`
    );
  } else {
    console.log('Pre-Market: Not available');
  }

  if (tslaExtended.afterHours) {
    console.log('After Hours:');
    console.log(`  Price: $${tslaExtended.afterHours.price.toFixed(2)}`);
    console.log(
      `  Change: ${tslaExtended.afterHours.change.toFixed(
        2
      )} (${tslaExtended.afterHours.changePercent.toFixed(2)}%)`
    );
    console.log(`  Volume: ${tslaExtended.afterHours.volume.toLocaleString()}`);
    console.log(
      `  Time: ${tslaExtended.afterHours.timestamp.toLocaleTimeString()}`
    );
  } else {
    console.log('After Hours: Not available');
  }
}

getExtendedHoursData().catch(console.error);
```

### Getting Technical Indicators

```typescript
import { MsnExplorer } from 'vnstock';

async function getTechnicalIndicators() {
  const msn = new MsnExplorer();

  // Get technical indicators for Amazon
  const indicators = await msn.getIndicators('AMZN', [
    'sma50',
    'sma200',
    'rsi',
    'macd',
    'bollinger',
  ]);

  console.log(`Technical Indicators for ${indicators.symbol}:`);

  const data = indicators.indicators;
  console.log(`SMA 50-Day: $${data.sma50.toFixed(2)}`);
  console.log(`SMA 200-Day: $${data.sma200.toFixed(2)}`);
  console.log(`RSI (14-Day): ${data.rsi.toFixed(2)}`);

  console.log('MACD:');
  console.log(`  MACD Line: ${data.macd_line.toFixed(2)}`);
  console.log(`  Signal Line: ${data.macd_signal.toFixed(2)}`);
  console.log(`  Histogram: ${data.macd_histogram.toFixed(2)}`);

  console.log('Bollinger Bands:');
  console.log(`  Upper: $${data.bollinger_upper.toFixed(2)}`);
  console.log(`  Middle: $${data.bollinger_middle.toFixed(2)}`);
  console.log(`  Lower: $${data.bollinger_lower.toFixed(2)}`);

  // Trading signals based on indicators
  if (data.rsi > 70) {
    console.log('RSI Signal: Overbought');
  } else if (data.rsi < 30) {
    console.log('RSI Signal: Oversold');
  } else {
    console.log('RSI Signal: Neutral');
  }

  if (data.macd_line > data.macd_signal) {
    console.log('MACD Signal: Bullish');
  } else {
    console.log('MACD Signal: Bearish');
  }
}

getTechnicalIndicators().catch(console.error);
```

## Advanced Example: Comparing Stocks

```typescript
import { MsnExplorer, HistoricalPeriod, DataInterval } from 'vnstock';

async function compareStocks() {
  const msn = new MsnExplorer({
    timeout: 60000,
    enableCaching: true,
  });

  // Define stocks to compare
  const stocks = ['AAPL', 'MSFT', 'GOOGL'];
  const period = HistoricalPeriod.ONE_YEAR;
  const interval = DataInterval.ONE_DAY;

  // Get historical data for all stocks in parallel
  const historicalDataPromises = stocks.map((symbol) =>
    msn.getHistoricalData(symbol, { period, interval })
  );

  const historicalData = await Promise.all(historicalDataPromises);

  // Calculate percentage change from the start
  const performanceData = historicalData.map((data) => {
    const prices = data.data.map((point) => point.close);
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const percentChange = ((endPrice - startPrice) / startPrice) * 100;

    return {
      symbol: data.symbol,
      startPrice,
      endPrice,
      percentChange,
      dataPoints: prices.length,
    };
  });

  // Sort by performance
  performanceData.sort((a, b) => b.percentChange - a.percentChange);

  // Display results
  console.log(`Stock Performance Comparison (${period}):`);
  console.table(
    performanceData.map((stock) => ({
      Symbol: stock.symbol,
      'Start Price': `$${stock.startPrice.toFixed(2)}`,
      'End Price': `$${stock.endPrice.toFixed(2)}`,
      'Change (%)': `${stock.percentChange.toFixed(2)}%`,
    }))
  );

  // Find the best and worst performers
  const bestPerformer = performanceData[0];
  const worstPerformer = performanceData[performanceData.length - 1];

  console.log(
    `Best Performer: ${
      bestPerformer.symbol
    } (${bestPerformer.percentChange.toFixed(2)}%)`
  );
  console.log(
    `Worst Performer: ${
      worstPerformer.symbol
    } (${worstPerformer.percentChange.toFixed(2)}%)`
  );
}

compareStocks().catch(console.error);
```

## Implementation Considerations

### Error Handling

Implement robust error handling for all quote functions:

```typescript
try {
  const quote = await msn.getQuote('AAPL');
  // Process quote data
} catch (error) {
  if (error.code === 'QUOTE_ERROR') {
    console.error('Error fetching quote:', error.message);
  } else if (error.code === 'VALIDATION_ERROR') {
    console.error('Invalid parameters:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Rate Limiting

Be mindful of MSN API rate limits:

1. Implement exponential backoff for retries
2. Add delays between consecutive requests
3. Use caching to reduce API calls
4. Group multiple symbols in one request when possible

### Caching

Implement caching for quote requests, especially for historical data:

```typescript
const cache = new Map();
const QUOTE_CACHE_TTL = 15 * 1000; // 15 seconds
const HISTORICAL_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getCachedQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_TTL) {
    return cached.data;
  }

  const msn = new MsnExplorer();
  const data = await msn.getQuote(symbol);

  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}
```

### Data Normalization

Ensure consistent data formats:

1. Handle missing or null values gracefully
2. Convert string numbers to actual number types
3. Format dates consistently
4. Normalize symbols (uppercase, handle spaces, etc.)

### Performance Optimization

Optimize performance for quote and historical data:

1. Use parallel requests with `Promise.all()` when fetching multiple symbols
2. Implement streaming for large historical datasets
3. Limit the amount of data returned for historical requests
4. Batch multiple symbol requests in a single API call

### Error Types and Handling

Define specific error types for different quote errors:

```typescript
class QuoteError extends Error {
  constructor(message, symbol) {
    super(`Quote error for ${symbol}: ${message}`);
    this.name = 'QuoteError';
    this.symbol = symbol;
  }
}

class HistoricalDataError extends Error {
  constructor(message, symbol, period) {
    super(`Historical data error for ${symbol} (${period}): ${message}`);
    this.name = 'HistoricalDataError';
    this.symbol = symbol;
    this.period = period;
  }
}
```

### Timezone Handling

Handle timezone differences in quote and historical data:

```typescript
// Convert UTC timestamp to local timezone
function convertToLocalTime(utcDate) {
  return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
}

// Format date for API requests
function formatDateForAPI(date) {
  return date.toISOString().split('T')[0];
}
```

## Related Documentation

- [MSN Explorer Overview](./index.md)
- [MSN Constants and Configuration](./const.md)
- [MSN Helper Functions](./helper.md)
- [MSN Listing Functions](./listing.md)
- [MSN Data Models](./models.md)
