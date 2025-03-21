# Implementation of Trading Module (VCI Explorer)

## Overview

The `trading.py` module in the Python `vnstock` package provides functionality to retrieve trading data from the VCI data source. It focuses on real-time market data, specifically the price board information which displays bid/ask orders, match prices, and other trading data for one or more symbols. This module is particularly useful for applications that need to display real-time market data or analyze current trading conditions.

## Classes and Methods

### `Trading` Class

The main class that provides access to trading data from VCI.

#### Constructor

```python
def __init__(self, symbol: Optional[str] = 'VCI', random_agent=False, show_log: Optional[bool] = True):
```

**Parameters:**

- `symbol`: Stock ticker symbol (default is 'VCI')
- `random_agent`: Whether to use a random user agent for API requests
- `show_log`: Whether to show log messages

#### Primary Public Method

1. **`price_board()`**: Retrieves price board data for a list of symbols

   ```python
   def price_board(self, symbols_list: List[str],
                  to_df: Optional[bool] = True,
                  show_log: Optional[bool] = False,
                  flatten_columns: Optional[bool] = False,
                  separator: Optional[str] = '_',
                  drop_levels: Optional[Union[int, List[int]]] = None):
   ```

   **Parameters:**

   - `symbols_list`: List of symbol tickers to retrieve data for
   - `to_df`: Whether to return a DataFrame (True) or raw JSON data (False)
   - `show_log`: Whether to show log messages
   - `flatten_columns`: Whether to flatten the hierarchical column structure
   - `separator`: Character to use when flattening hierarchical columns
   - `drop_levels`: Levels to drop when flattening

## Implementation Details

### Data Flow

1. The user creates a `Trading` instance with an optional default symbol
2. The `price_board` method is called with a list of symbols
3. A POST request is sent to the VCI API endpoint
4. Response data is processed and transformed
5. Data is structured with hierarchical columns grouping related information
6. The processed data is returned as a DataFrame or raw JSON

### API Endpoints

The module uses the following API endpoint:

- Price Board: `https://mt.vietcap.com.vn/api/price/symbols/getList`

### Data Structure

The price board data is organized into three main categories:

1. **Listing Information**: General information about the listed security
2. **Bid/Ask Information**: Current bid and ask prices and volumes
3. **Match Information**: Information about the last matched trade

### Data Processing

The module performs several transformations on the raw API data:

1. Flattens nested JSON structures
2. Extracts bid and ask prices and volumes dynamically
3. Creates a hierarchical column structure in the DataFrame
4. Drops unnecessary columns
5. Renames columns for clarity
6. Optionally flattens the hierarchical structure if requested

## TypeScript Implementation

### TypeScript Interface

```typescript
interface TradingOptions {
  symbol?: string;
  randomAgent?: boolean;
  showLog?: boolean;
}

interface PriceBoardOptions {
  symbolsList: string[];
  toDataFrame?: boolean;
  showLog?: boolean;
  flattenColumns?: boolean;
  separator?: string;
  dropLevels?: number | number[];
}
```

### TypeScript Class Implementation

```typescript
import axios from 'axios';
import { getAssetType } from '../../core/utils/parser';
import { getHeaders } from '../../core/utils/client';
import { getLogger } from '../../core/utils/logger';
import {
  flattenData,
  flattenHierarchicalIndex,
} from '../../core/utils/transform';
import { TRADING_URL } from './const';

const logger = getLogger('vci.trading');

/**
 * Class to access trading data from VCI
 */
export class Trading {
  private symbol: string;
  private assetType: string;
  private baseUrl: string;
  private headers: Record<string, string>;
  private showLog: boolean;

  /**
   * Create a Trading instance for retrieving trading data
   */
  constructor(options: TradingOptions = {}) {
    const { symbol = 'VCI', randomAgent = false, showLog = true } = options;

    this.symbol = symbol.toUpperCase();
    this.assetType = getAssetType(this.symbol);
    this.baseUrl = TRADING_URL;
    this.headers = getHeaders('VCI', randomAgent);
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel('error');
    }
  }

  /**
   * Retrieve price board data for a list of symbols
   */
  public async priceBoard(options: PriceBoardOptions): Promise<any> {
    const {
      symbolsList,
      toDataFrame = true,
      showLog = false,
      flattenColumns = false,
      separator = '_',
      dropLevels = null,
    } = options;

    try {
      const url = `${this.baseUrl}price/symbols/getList`;
      const payload = { symbols: symbolsList };

      if (showLog) {
        logger.info(
          `Requested URL: ${url} with query payload: ${JSON.stringify(payload)}`
        );
      }

      const response = await axios.post(url, payload, {
        headers: this.headers,
      });

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch data: ${response.status} - ${response.statusText}`
        );
      }

      const data = response.data;

      // If raw JSON is requested, return it
      if (!toDataFrame) {
        return data;
      }

      // Process the data into a format similar to a DataFrame
      const rows = data.map((item: any) => {
        // Prepare nested data structure
        const itemData = {
          listing: item.listingInfo,
          bidAsk: item.bidAsk,
          match: item.matchPrice,
        };

        // Flatten the nested structure
        const row = flattenData(itemData);

        // Add bid and ask prices dynamically
        try {
          if (item.bidAsk && item.bidAsk.bidPrices) {
            item.bidAsk.bidPrices.forEach((bid: any, index: number) => {
              row[`bidAsk_bid_${index + 1}_price`] = bid.price;
              row[`bidAsk_bid_${index + 1}_volume`] = bid.volume;
            });
          }

          if (item.bidAsk && item.bidAsk.askPrices) {
            item.bidAsk.askPrices.forEach((ask: any, index: number) => {
              row[`bidAsk_ask_${index + 1}_price`] = ask.price;
              row[`bidAsk_ask_${index + 1}_volume`] = ask.volume;
            });
          }
        } catch (error) {
          // Silently handle missing bid/ask data
        }

        return row;
      });

      // Create a dataframe-like object with hierarchical columns
      const result = this.processDataFrame(
        rows,
        flattenColumns,
        separator,
        dropLevels
      );

      // Add source metadata
      Object.defineProperty(result, 'source', { value: 'VCI' });

      return result;
    } catch (error) {
      logger.error(`Error retrieving price board: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process raw data into a dataframe-like structure with hierarchical columns
   * @private
   */
  private processDataFrame(
    rows: any[],
    flattenColumns: boolean,
    separator: string,
    dropLevels: number | number[] | null
  ): any {
    // Implementation of hierarchical column structure and column renaming
    // This is a simplified version as TypeScript doesn't have built-in DataFrame functionality

    // Create hierarchical column structure
    const processedRows = rows.map((row) => {
      const processed: Record<string, any> = {};

      Object.keys(row).forEach((key) => {
        const parts = key.split('_');
        const category = parts[0];
        const remainingParts = parts.slice(1).join('_');

        if (!processed[category]) {
          processed[category] = {};
        }

        processed[category][remainingParts] = row[key];
      });

      return processed;
    });

    // Drop unnecessary columns
    const columnsToRemove = [
      ['bidAsk', 'code'],
      ['bidAsk', 'symbol'],
      ['bidAsk', 'session'],
      ['bidAsk', 'receivedTime'],
      ['bidAsk', 'messageType'],
      ['bidAsk', 'time'],
      ['bidAsk', 'bidPrices'],
      ['bidAsk', 'askPrices'],
      ['listing', 'code'],
      ['listing', 'exercisePrice'],
      ['listing', 'exerciseRatio'],
      ['listing', 'maturityDate'],
      ['listing', 'underlyingSymbol'],
      ['listing', 'issuerName'],
      ['listing', 'receivedTime'],
      ['listing', 'messageType'],
      ['listing', 'enOrganName'],
      ['listing', 'enOrganShortName'],
      ['listing', 'organShortName'],
      ['listing', 'ticker'],
      ['match', 'code'],
      ['match', 'symbol'],
      ['match', 'receivedTime'],
      ['match', 'messageType'],
      ['match', 'time'],
      ['match', 'session'],
    ];

    // Remove specified columns
    processedRows.forEach((row) => {
      columnsToRemove.forEach(([category, field]) => {
        if (row[category] && row[category][field] !== undefined) {
          delete row[category][field];
        }
      });

      // Rename 'board' to 'exchange' in listing category
      if (row.listing && row.listing.board !== undefined) {
        row.listing.exchange = row.listing.board;
        delete row.listing.board;
      }
    });

    // Flatten hierarchical structure if requested
    if (flattenColumns) {
      return processedRows.map((row) => {
        return flattenHierarchicalIndex(row, separator, dropLevels);
      });
    }

    return processedRows;
  }
}
```

### Usage Example

```typescript
import { Trading } from 'vnstock-ts';

async function getPriceBoardData() {
  // Create a Trading instance
  const trading = new Trading({
    showLog: true,
  });

  try {
    // Get price board data for multiple symbols
    const priceBoard = await trading.priceBoard({
      symbolsList: ['VNM', 'VHM', 'VIC', 'FPT'],
      flattenColumns: true,
    });

    console.log('Price Board Data:');

    // Display basic information for each symbol
    priceBoard.forEach((item: any) => {
      console.log(`Symbol: ${item.listing_symbol}`);
      console.log(`  Price: ${item.match_price}`);
      console.log(
        `  Change: ${item.match_price_change} (${item.match_percent_price_change}%)`
      );
      console.log(`  Volume: ${item.match_match_volume}`);
      console.log(
        `  Best Bid: ${item.bidAsk_bid_1_price} (${item.bidAsk_bid_1_volume})`
      );
      console.log(
        `  Best Ask: ${item.bidAsk_ask_1_price} (${item.bidAsk_ask_1_volume})`
      );
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching price board data:', error);
  }
}

getPriceBoardData();
```

## Dependencies

### Required Packages

- `axios`: For making HTTP requests
- Data processing utilities (for handling hierarchical data and transformations)

### Internal Dependencies

- `getAssetType` (from `core/utils/parser`): To determine asset type from symbol
- `getHeaders` (from `core/utils/client`): To get appropriate headers for API requests
- `getLogger` (from `core/utils/logger`): For logging functionality
- `flattenData` & `flattenHierarchicalIndex` (from `core/utils/transform`): For data transformation
- `TRADING_URL` (from `./const`): For API endpoint URLs

## Implementation Notes

1. **Hierarchical Data Structure**:

   - Python uses pandas MultiIndex for hierarchical columns
   - In TypeScript, we simulate this with nested objects and optional flattening

2. **Data Transformation**:

   - The complex data transformation from nested JSON to a hierarchical structure requires custom utility functions
   - Consider implementing a specialized data structure for price board data

3. **Bid/Ask Data Handling**:

   - The original Python code dynamically extracts bid/ask prices and volumes
   - The TypeScript version needs to handle this similarly while accommodating variable numbers of price levels

4. **Performance Considerations**:

   - Price board data can be voluminous, especially when tracking many symbols
   - Consider implementing streaming updates for real-time applications

5. **Error Handling**:

   - Robust error handling is important for real-time data applications
   - Implement retry logic for transient network issues

6. **DataFrame Simulation**:
   - Without pandas, we need to simulate DataFrame behavior
   - The implementation provides a similar structure but lacks all pandas functionality

By following this implementation guide, you can create a TypeScript version of the VCI Trading module that provides the same core functionality for retrieving and processing price board data for Vietnamese securities.
