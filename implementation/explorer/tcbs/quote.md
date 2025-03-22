# TCBS Quote Data Implementation

**Original Python Implementation**: [quote.py](/vnstock/explorer/tcbs/quote.py)


## Overview

This document details the implementation of stock quote-related functionality in the TCBS explorer. This includes real-time stock quotes, intraday trading data, and historical OHLC (Open, High, Low, Close) price data.

## Stock Quote API

### Endpoint Information

The TCBS stock quote API provides real-time and delayed price information for stocks on the Vietnam stock market.

- **Base URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock`
- **Quote Endpoint**: `/quote/{symbol}`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns quote data with the following structure:

```json
{
  "data": {
    "symbol": "VNM",
    "price": 80500,
    "priceChange": -500,
    "pctChange": -0.62,
    "volume": 1245600,
    "value": 100247920000,
    "high": 81000,
    "low": 80000,
    "open": 80500,
    "prevClose": 81000,
    "marketCap": 168276050000000,
    "timestamp": "2023-04-18T10:30:00.000Z"
  },
  "status": "success",
  "message": null
}
```

### Implementation

The stock quote functionality can be implemented with the following TypeScript code:

```typescript
import { TcbsResponse, TcbsStockQuote } from './models';
import { BaseExplorer } from '../base';

export class TcbsExplorer extends BaseExplorer {
  private baseUrl = 'https://apipubaws.tcbs.com.vn';

  constructor() {
    super('TCBS');
    // Set any specific headers required for TCBS
    this.headers = {
      ...this.headers,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get real-time quote for a stock symbol
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to quote data
   */
  async getQuote(symbol: string): Promise<TcbsResponse<TcbsStockQuote>> {
    this.validateSymbol(symbol);

    const url = `${this.baseUrl}/stock-insight/v1/stock/quote/${symbol}`;
    const response = await this.sendRequest<TcbsResponse<TcbsStockQuote>>(
      url,
      'GET'
    );

    return response;
  }

  /**
   * Get quotes for multiple stock symbols
   *
   * @param symbols Array of stock symbols
   * @returns Promise resolving to an array of quotes
   */
  async getQuotes(symbols: string[]): Promise<TcbsResponse<TcbsStockQuote[]>> {
    if (!symbols.length) {
      throw new Error('At least one symbol must be provided');
    }

    symbols.forEach(this.validateSymbol);

    // TCBS doesn't have a bulk quote endpoint, so we need to make multiple requests
    const quotes = await Promise.all(
      symbols.map((symbol) => this.getQuote(symbol))
    );

    // Combine the results
    return {
      data: quotes.map((quote) => quote.data),
      status: 'success',
      message: null,
    };
  }

  /**
   * Validate stock symbol format
   *
   * @param symbol Stock symbol to validate
   * @throws Error if symbol is invalid
   */
  private validateSymbol(symbol: string): void {
    if (
      !symbol ||
      typeof symbol !== 'string' ||
      !/^[A-Z0-9]{3,6}$/.test(symbol)
    ) {
      throw new Error(`Invalid symbol format: ${symbol}`);
    }
  }
}
```

## Intraday Data API

### Endpoint Information

The TCBS intraday data API provides minute-by-minute price and volume data for a trading day.

- **Base URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock`
- **Intraday Endpoint**: `/intraday/{symbol}`
- **Method**: GET
- **Optional Parameters**:
  - `date`: Trading date in YYYY-MM-DD format (defaults to current date)
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns intraday data with the following structure:

```json
{
  "data": [
    {
      "time": "09:15:00",
      "price": 80500,
      "volume": 1200,
      "value": 96600000
    },
    {
      "time": "09:16:00",
      "price": 80600,
      "volume": 800,
      "value": 64480000
    }
    // Additional minute data...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The intraday data functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Intraday data point
 */
interface TcbsIntradayPoint {
  time: string;
  price: number;
  volume: number;
  value: number;
}

/**
 * Get intraday trading data for a stock
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @param date Optional trading date (default: current date)
 * @returns Promise resolving to intraday data
 */
async getIntraday(
  symbol: string,
  date?: string
): Promise<TcbsResponse<TcbsIntradayPoint[]>> {
  this.validateSymbol(symbol);

  let url = `${this.baseUrl}/stock-insight/v1/stock/intraday/${symbol}`;

  // Add date parameter if provided
  if (date) {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    url += `?date=${date}`;
  }

  const response = await this.sendRequest<TcbsResponse<TcbsIntradayPoint[]>>(url, 'GET');

  return response;
}
```

## Historical OHLC Data API

### Endpoint Information

The TCBS historical OHLC data API provides daily, weekly, or monthly price data for a specified time range.

- **Base URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock`
- **Historical Endpoint**: `/historical/{symbol}`
- **Method**: GET
- **Required Parameters**:
  - `from`: Start date in YYYY-MM-DD format
  - `to`: End date in YYYY-MM-DD format
- **Optional Parameters**:
  - `resolution`: Time resolution (D=daily, W=weekly, M=monthly) - default is 'D'
  - `adjusted`: Adjust for dividends (true/false) - default is 'true'
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns historical OHLC data with the following structure:

```json
{
  "data": [
    {
      "date": "2023-04-18",
      "open": 80500,
      "high": 81000,
      "low": 80000,
      "close": 80500,
      "volume": 1245600,
      "adjClose": 80500
    },
    {
      "date": "2023-04-17",
      "open": 81500,
      "high": 82000,
      "low": 81000,
      "close": 81000,
      "volume": 1358400,
      "adjClose": 81000
    }
    // Additional daily data...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The historical OHLC data functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Resolution for historical data
 */
export enum TcbsResolution {
  DAILY = 'D',
  WEEKLY = 'W',
  MONTHLY = 'M'
}

/**
 * Parameters for historical data request
 */
export interface HistoricalParams {
  fromDate: string;
  toDate: string;
  resolution?: TcbsResolution;
  adjusted?: boolean;
}

/**
 * Get historical OHLC data for a stock
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @param params Historical data parameters
 * @returns Promise resolving to historical OHLC data
 */
async getHistoricalOHLC(
  symbol: string,
  params: HistoricalParams
): Promise<TcbsResponse<TcbsHistoricalPrice[]>> {
  this.validateSymbol(symbol);

  // Validate date formats
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.fromDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(params.toDate)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }

  // Default values
  const resolution = params.resolution || TcbsResolution.DAILY;
  const adjusted = params.adjusted !== undefined ? params.adjusted : true;

  const url = `${this.baseUrl}/stock-insight/v1/stock/historical/${symbol}?from=${params.fromDate}&to=${params.toDate}&resolution=${resolution}&adjusted=${adjusted}`;

  const response = await this.sendRequest<TcbsResponse<TcbsHistoricalPrice[]>>(url, 'GET');

  return response;
}
```

## Error Handling

The TCBS APIs may return various error responses that should be properly handled:

1. **Invalid Symbol**: When the provided symbol doesn't exist
2. **Invalid Date Range**: When the date range is invalid or too large
3. **Rate Limiting**: When too many requests are made in a short period
4. **Service Unavailable**: When the TCBS service is down

Here's an example of comprehensive error handling:

```typescript
/**
 * Send HTTP request with error handling
 */
private async sendRequest<T>(url: string, method: string): Promise<T> {
  try {
    const response = await fetch(url, {
      method,
      headers: this.headers,
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorBody = await response.json();

      // Handle specific error codes
      if (response.status === 404) {
        throw new Error(`Resource not found: ${errorBody.message || 'Symbol may not exist'}`);
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`TCBS API error: ${errorBody.message || response.statusText}`);
      }
    }

    const data = await response.json();

    // Check for application-level errors
    if (data.status === 'error') {
      throw new Error(`TCBS API error: ${data.message}`);
    }

    return data;
  } catch (error) {
    // Wrap and rethrow
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Unknown error: ${String(error)}`);
    }
  }
}
```

## Usage Examples

### Getting a Stock Quote

```typescript
const tcbsExplorer = new TcbsExplorer();

// Get quote for a single stock
const getVnmQuote = async () => {
  try {
    const quote = await tcbsExplorer.getQuote('VNM');
    console.log(`Current price: ${quote.data.price}`);
    console.log(`Change: ${quote.data.priceChange} (${quote.data.pctChange}%)`);
    console.log(`Volume: ${quote.data.volume}`);
  } catch (error) {
    console.error('Error fetching quote:', error);
  }
};

// Get quotes for multiple stocks
const getMultipleQuotes = async () => {
  try {
    const quotes = await tcbsExplorer.getQuotes(['VNM', 'FPT', 'VCB']);
    quotes.data.forEach((quote) => {
      console.log(`${quote.symbol}: ${quote.price} (${quote.pctChange}%)`);
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
  }
};
```

### Getting Intraday Data

```typescript
const tcbsExplorer = new TcbsExplorer();

const getIntradayData = async () => {
  try {
    // Get intraday data for the current day
    const intraday = await tcbsExplorer.getIntraday('VNM');

    // Print the data
    console.log(`Intraday data for VNM (${intraday.data.length} points):`);
    intraday.data.slice(0, 5).forEach((point) => {
      console.log(`${point.time}: ${point.price} (${point.volume} shares)`);
    });

    // Calculate some statistics
    const totalVolume = intraday.data.reduce(
      (sum, point) => sum + point.volume,
      0
    );
    const avgPrice =
      intraday.data.reduce((sum, point) => sum + point.price, 0) /
      intraday.data.length;

    console.log(`Total volume: ${totalVolume}`);
    console.log(`Average price: ${avgPrice.toFixed(2)}`);
  } catch (error) {
    console.error('Error fetching intraday data:', error);
  }
};
```

### Getting Historical Data

```typescript
const tcbsExplorer = new TcbsExplorer();

const getHistoricalData = async () => {
  try {
    // Get one month of daily data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const historical = await tcbsExplorer.getHistoricalOHLC('VNM', {
      fromDate: formatDate(startDate),
      toDate: formatDate(endDate),
      resolution: TcbsResolution.DAILY,
      adjusted: true,
    });

    // Print the data
    console.log(`Historical data for VNM (${historical.data.length} days):`);
    historical.data.slice(0, 5).forEach((day) => {
      console.log(
        `${day.date}: Open ${day.open}, High ${day.high}, Low ${day.low}, Close ${day.close}, Volume ${day.volume}`
      );
    });

    // Calculate returns
    const firstClose = historical.data[historical.data.length - 1].close;
    const lastClose = historical.data[0].close;
    const returnPct = ((lastClose - firstClose) / firstClose) * 100;

    console.log(`Return over period: ${returnPct.toFixed(2)}%`);
  } catch (error) {
    console.error('Error fetching historical data:', error);
  }
};
```

## Implementation Considerations

1. **Caching**: Consider implementing a caching mechanism for quote and historical data to reduce API calls.
2. **Rate Limiting**: Implement rate limiting to avoid exceeding TCBS API limits.
3. **Retry Logic**: Add retry logic for transient failures.
4. **Data Transformation**: Convert the numeric values to proper units (e.g., divide price by 1000 if needed).
5. **Error Handling**: Implement comprehensive error handling for all API calls.

## Related Documentation

- [TCBS Models](./models.md) - Data models used in these implementations
- [TCBS Explorer Overview](./index.md) - Overview of the TCBS explorer
- [BaseExplorer](../base.md) - Base explorer class that TcbsExplorer extends
