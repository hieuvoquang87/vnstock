# VCI Quote Implementation

**Original Python Implementation**: [quote.py](/vnstock/explorer/vci/quote.py)


## Overview

The `quote.py` file contains the `Quote` class which provides functions to retrieve historical price data, intraday trading data, and price depth statistics for stocks from the VCI data source.

## Class: Quote

### Purpose

Provides access to historical and real-time stock price data from VCI data source.

### Constructor Parameters

- `symbol` (required): Stock symbol to query (e.g., "VCB", "HPG")
- `random_agent` (optional): Boolean flag to use a random user agent for requests. Default is `false`.
- `show_log` (optional): Boolean flag to show detailed logs. Default is `true`.

### Properties

- `symbol`: The stock symbol (uppercase)
- `data_source`: String constant "VCI"
- `asset_type`: The asset type determined by the symbol
- `base_url`: Base URL for API requests
- `headers`: HTTP headers for API requests
- `interval_map`: Mapping of interval strings to numeric values
- `show_log`: Boolean flag for logging

### Methods

#### Private Methods

##### `_index_validation()`

Validates and maps index symbols to their API equivalents.

- Returns: String - The mapped index symbol
- Throws: Error if the symbol is not a valid index

##### `_input_validation(start, end, interval)`

Validates input parameters for data retrieval.

- Parameters:
  - `start`: String - Start date in "YYYY-MM-DD" format
  - `end`: String - End date in "YYYY-MM-DD" format
  - `interval`: String - Time interval (e.g., "1D", "1H")
- Returns: TickerModel - Validated input model
- Throws: Error if parameters are invalid

#### Public Methods

##### `history(start, end, interval, to_df, show_log, count_back, floating)`

Retrieves historical price data for the stock.

- Parameters:
  - `start` (required): String - Start date in "YYYY-MM-DD" format
  - `end` (optional): String - End date in "YYYY-MM-DD" format. Default is current date.
  - `interval` (optional): String - Time interval. Values: "1m", "5m", "15m", "30m", "1H", "1D", "1W", "1M". Default is "1D".
  - `to_df` (optional): Boolean - Return data as DataFrame. Default is `true`. If `false`, returns JSON.
  - `show_log` (optional): Boolean - Show detailed logs. Default is `false`.
  - `count_back` (optional): Number - Number of records to return from the end. Default is `null`.
  - `floating` (optional): Number - Decimal precision for prices. Default is 2.
- Returns: DataFrame or JSON string with OHLCV data

##### `intraday(page_size, last_time, to_df, show_log)`

Retrieves intraday trading data for the stock.

- Parameters:
  - `page_size` (optional): Number - Number of records to retrieve. Default is 100.
  - `last_time` (optional): String - Timestamp to get data after. Default is `null`.
  - `to_df` (optional): Boolean - Return data as DataFrame. Default is `true`. If `false`, returns JSON.
  - `show_log` (optional): Boolean - Show detailed logs. Default is `false`.
- Returns: DataFrame or JSON string with intraday trading data

##### `price_depth(to_df, show_log)`

Retrieves price depth statistics for the stock.

- Parameters:
  - `to_df` (optional): Boolean - Return data as DataFrame. Default is `true`. If `false`, returns JSON.
  - `show_log` (optional): Boolean - Show detailed logs. Default is `false`.
- Returns: DataFrame or JSON string with price depth data

## Implementation Details

### Data Flow

1. User creates a `Quote` instance with a stock symbol
2. The constructor initializes connection parameters and validates the symbol
3. Methods make API requests to VCI endpoints with appropriate parameters
4. Data is transformed using utility functions before being returned to the user

### API Requests

The module uses the following API endpoints:

- Historical data: `{base_url}/api/chart/history`
- Intraday data: `{base_url}/trade/LEData/getAll`
- Price depth: `{base_url}/trade/AccumulatedPriceStepVol/getSymbolData`

### Data Transformation

- Historical data is transformed using `ohlc_to_df` utility
- Intraday data is transformed using `intraday_to_df` utility
- Price depth data is transformed directly in the method

### Error Handling

- Methods validate input parameters before making requests
- Market session checks prevent requests during market preparation periods
- HTTP request errors are caught and formatted for the user

### Dependencies

- In Python:
  - pandas
  - datetime
  - Pydantic (via TickerModel)
  - Custom utilities: logger, market, parser, user_agent, client, transform

## TypeScript Implementation Example

```typescript
/**
 * Quote class for retrieving stock price data from VCI
 */
export class Quote {
  private symbol: string;
  private dataSource: string;
  private assetType: string;
  private baseUrl: string;
  private headers: Record<string, string>;
  private intervalMap: Record<string, number>;
  private showLog: boolean;

  /**
   * Creates a new Quote instance
   * @param symbol Stock symbol
   * @param randomAgent Whether to use a random user agent
   * @param showLog Whether to show detailed logs
   */
  constructor(
    symbol: string,
    randomAgent: boolean = false,
    showLog: boolean = true
  ) {
    this.symbol = symbol.toUpperCase();
    this.dataSource = 'VCI';
    this.assetType = getAssetType(this.symbol);
    this.baseUrl = TRADING_URL;
    this.headers = getHeaders(this.dataSource);
    this.intervalMap = INTERVAL_MAP;
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel(LogLevel.CRITICAL);
    }

    if (this.symbol.includes('INDEX')) {
      this.symbol = this.validateIndex();
    }
  }

  /**
   * Validates and maps index symbols
   * @returns Mapped index symbol
   */
  private validateIndex(): string {
    if (!Object.keys(INDEX_MAPPING).includes(this.symbol)) {
      throw new Error(
        `Cannot find symbol ${this.symbol}. Valid values: ${Object.keys(
          INDEX_MAPPING
        ).join(', ')}`
      );
    }
    return INDEX_MAPPING[this.symbol];
  }

  /**
   * Validates input parameters
   * @param start Start date
   * @param end End date
   * @param interval Time interval
   * @returns Validated ticker model
   */
  private validateInput(
    start: string,
    end: string | null,
    interval: string
  ): TickerModel {
    if (!Object.keys(this.intervalMap).includes(interval)) {
      throw new Error(
        `Invalid interval: ${interval}. Please select: ${Object.keys(
          this.intervalMap
        ).join(', ')}`
      );
    }

    return {
      symbol: this.symbol,
      start: start,
      end: end || new Date().toISOString().split('T')[0],
      interval: interval,
    };
  }

  /**
   * Retrieves historical price data
   * @param start Start date in YYYY-MM-DD format
   * @param end End date in YYYY-MM-DD format
   * @param interval Time interval (1m, 5m, 15m, 30m, 1H, 1D, 1W, 1M)
   * @param toJson Whether to return data as JSON
   * @param showLog Whether to show detailed logs
   * @param countBack Number of records to return from the end
   * @param floating Decimal precision for prices
   * @returns Historical price data
   */
  async history(
    start: string,
    end: string | null = null,
    interval: string = '1D',
    toJson: boolean = false,
    showLog: boolean = false,
    countBack: number | null = null,
    floating: number = 2
  ): Promise<any> {
    // Implementation as per the Python version
    // 1. Validate inputs
    // 2. Convert dates to timestamps
    // 3. Make API request
    // 4. Transform and return data
  }

  /**
   * Retrieves intraday trading data
   * @param pageSize Number of records to retrieve
   * @param lastTime Timestamp to get data after
   * @param toJson Whether to return data as JSON
   * @param showLog Whether to show detailed logs
   * @returns Intraday trading data
   */
  async intraday(
    pageSize: number = 100,
    lastTime: string | null = null,
    toJson: boolean = false,
    showLog: boolean = false
  ): Promise<any> {
    // Implementation as per the Python version
    // 1. Check market status
    // 2. Validate inputs
    // 3. Make API request
    // 4. Transform and return data
  }

  /**
   * Retrieves price depth statistics
   * @param toJson Whether to return data as JSON
   * @param showLog Whether to show detailed logs
   * @returns Price depth data
   */
  async priceDepth(
    toJson: boolean = false,
    showLog: boolean = false
  ): Promise<any> {
    // Implementation as per the Python version
    // 1. Check market status
    // 2. Make API request
    // 3. Transform and return data
  }
}
```

## Constants Required

This module depends on several constants that should be defined in the `const.ts` file:

- `_BASE_URL`: Base URL for API
- `_TRADING_URL`: URL for trading API
- `_CHART_URL`: Endpoint for chart data
- `_INTERVAL_MAP`: Mapping of interval strings to numeric values
- `_OHLC_MAP`: Mapping of OHLC column names
- `_RESAMPLE_MAP`: Mapping for resampling data
- `_OHLC_DTYPE`: Data types for OHLC columns
- `_INTRADAY_URL`: Endpoint for intraday data
- `_INTRADAY_MAP`: Mapping of intraday column names
- `_INTRADAY_DTYPE`: Data types for intraday columns
- `_PRICE_DEPTH_MAP`: Mapping for price depth data
- `_INDEX_MAPPING`: Mapping of index symbols

## Utility Functions Required

The module depends on these utility functions:

- `get_logger`: Creates a logger instance
- `trading_hours`: Checks current market trading hours
- `get_asset_type`: Determines asset type from symbol
- `get_headers`: Generates HTTP headers
- `send_request`: Makes HTTP requests
- `ohlc_to_df`: Transforms OHLC data
- `intraday_to_df`: Transforms intraday data
