# Implementation of Listing Module (VCI Explorer)

**Original Python Implementation**: [listing.py](/vnstock/explorer/vci/listing.py)


## Overview

The `listing.py` module in the Python `vnstock` package provides functionality to retrieve listings and symbol data from the VCI data source. It offers methods to fetch lists of stocks by different criteria, including all symbols, industry classification, exchange, and predefined groups. The module also provides convenience methods for retrieving specialized instrument types such as futures, bonds, and covered warrants.

## Classes and Methods

### `Listing` Class

The main class that provides access to symbol listing data from VCI.

#### Constructor

```python
def __init__(self, random_agent: Optional[bool] = False, show_log: Optional[bool] = False):
```

**Parameters:**

- `random_agent`: Whether to use a random user agent for API requests
- `show_log`: Whether to show log messages

#### Primary Public Methods

1. **`all_symbols()`**: Retrieves a list of all stock symbols

   ```python
   def all_symbols(self, show_log: Optional[bool] = False, to_df: Optional[bool] = True) -> Dict:
   ```

2. **`symbols_by_industries()`**: Retrieves stock symbols classified by industry

   ```python
   def symbols_by_industries(self, show_log: Optional[bool] = False, to_df: Optional[bool] = True):
   ```

3. **`symbols_by_exchange()`**: Retrieves stock symbols by exchange/board

   ```python
   def symbols_by_exchange(self, show_log: Optional[bool] = False, to_df: Optional[bool] = True):
   ```

4. **`symbols_by_group()`**: Retrieves symbols by predefined groups (VN30, HNX30, etc.)
   ```python
   def symbols_by_group(self, group: str = 'VN30', show_log: Optional[bool] = False, to_df: Optional[bool] = True):
   ```

#### Specialized Listing Methods

1. **`all_future_indices()`**: Retrieves all future index symbols

   ```python
   def all_future_indices(self, show_log: Optional[bool] = False, to_df: Optional[bool] = True):
   ```

2. **`all_government_bonds()`**: Retrieves all government bond symbols

   ```python
   def all_government_bonds(self, show_log: Optional[bool] = False, to_df: Optional[bool] = True):
   ```

3. **`all_covered_warrant()`**: Retrieves all covered warrant symbols

   ```python
   def all_covered_warrant(self, show_log: Optional[bool] = False, to_df: Optional[bool] = True):
   ```

4. **`all_bonds()`**: Retrieves all bond symbols
   ```python
   def all_bonds(self, show_log: Optional[bool] = False, to_df: Optional[bool] = True):
   ```

## Implementation Details

### Data Flow

1. The user creates a `Listing` instance
2. Methods are called to retrieve different types of listings
3. API requests are made to VCI endpoints
4. Response data is parsed and transformed
5. Data is returned either as a DataFrame or JSON

### API Endpoints

The module uses the following API endpoints:

1. All Symbols: `https://ai.vietcap.com.vn/api/get_all_tickers`
2. Symbols by Industries: `https://api.vietcap.com.vn/data-mt/graphql`
3. Symbols by Exchange: `https://mt.vietcap.com.vn/api/price/symbols/getAll`
4. Symbols by Group: `https://mt.vietcap.com.vn/api/price/symbols/getByGroup?group={group}`

### Data Processing

For each listing method:

1. An HTTP request is made to the appropriate endpoint
2. Response data is validated (status code, non-empty)
3. Data is transformed:
   - Column names are converted from camelCase to snake_case
   - 'ticker' is renamed to 'symbol' for consistency
   - Metadata is added (source attribution)
4. Data is returned in the requested format (DataFrame or JSON)

## TypeScript Implementation

### TypeScript Interface

```typescript
interface ListingOptions {
  randomAgent?: boolean;
  showLog?: boolean;
}

interface ListingMethodOptions {
  showLog?: boolean;
  toDataFrame?: boolean; // Renamed from to_df for TypeScript conventions
}

interface GroupListingOptions extends ListingMethodOptions {
  group: string;
}
```

### TypeScript Class Implementation

```typescript
import axios from 'axios';
import { getHeaders } from '../../core/utils/client';
import { getLogger } from '../../core/utils/logger';
import { camelToSnake } from '../../core/utils/parser';
import { GROUP_CODE } from './const';

const logger = getLogger('vci.listing');

/**
 * Class to access stock listing data from VCI
 */
export class Listing {
  private dataSource: string;
  private headers: Record<string, string>;
  private showLog: boolean;

  /**
   * Create a Listing instance for retrieving symbol listings
   */
  constructor(options: ListingOptions = {}) {
    const { randomAgent = false, showLog = false } = options;

    this.dataSource = 'VCI';
    this.headers = getHeaders(this.dataSource, randomAgent);
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel('error');
    }
  }

  /**
   * Retrieve a list of all stock symbols
   */
  public async allSymbols(options: ListingMethodOptions = {}): Promise<any> {
    const { showLog = false, toDataFrame = true } = options;

    try {
      const url = 'https://ai.vietcap.com.vn/api/get_all_tickers';
      const response = await axios.get(url, { headers: this.headers });

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch data: ${response.status} - ${response.statusText}`
        );
      }

      const jsonData = response.data;

      if (showLog) {
        logger.info(
          `Successfully retrieved simplified list data for ${jsonData.record_count} symbols.`
        );
      }

      // Create dataframe-like object
      const df = jsonData.ticker_info;

      if (toDataFrame) {
        if (!jsonData || !jsonData.ticker_info) {
          throw new Error('JSON data is empty or not provided.');
        }

        // Add metadata
        Object.defineProperty(df, 'source', { value: 'VCI' });
        return df;
      } else {
        return JSON.stringify(df);
      }
    } catch (error) {
      logger.error(`Error retrieving all symbols: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve stock symbols classified by industry
   */
  public async symbolsByIndustries(
    options: ListingMethodOptions = {}
  ): Promise<any> {
    const { showLog = false, toDataFrame = true } = options;

    try {
      const url = 'https://api.vietcap.com.vn/data-mt/graphql';
      const payload = {
        query: `{
          CompaniesListingInfo {
            ticker
            organName
            enOrganName
            icbName3
            enIcbName3
            icbName2
            enIcbName2
            icbName4
            enIcbName4
            comTypeCode
            icbCode1
            icbCode2
            icbCode3
            icbCode4
            __typename
          }
        }`,
        variables: {},
      };

      const response = await axios.post(url, payload, {
        headers: this.headers,
      });

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch data: ${response.status} - ${response.statusText}`
        );
      }

      const jsonData = response.data;

      if (showLog) {
        logger.info(
          'Successfully retrieved stock listing data by ICB industry classification.'
        );
      }

      let df = jsonData.data.CompaniesListingInfo;

      if (toDataFrame) {
        if (
          !jsonData ||
          !jsonData.data ||
          !jsonData.data.CompaniesListingInfo
        ) {
          throw new Error('JSON data is empty or not provided.');
        }

        // Remove __typename field
        df = df.map((item) => {
          const { __typename, ...rest } = item;
          return rest;
        });

        // Convert column names to snake_case
        df = df.map((item) => {
          const newItem: Record<string, any> = {};
          Object.keys(item).forEach((key) => {
            const newKey = key === 'ticker' ? 'symbol' : camelToSnake(key);
            newItem[newKey] = item[key];
          });
          return newItem;
        });

        // Add metadata
        Object.defineProperty(df, 'source', { value: 'VCI' });
        return df;
      } else {
        return JSON.stringify(df);
      }
    } catch (error) {
      logger.error(`Error retrieving symbols by industries: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve stock symbols by exchange
   */
  public async symbolsByExchange(
    options: ListingMethodOptions = {}
  ): Promise<any> {
    const { showLog = false, toDataFrame = true } = options;

    try {
      const url = 'https://mt.vietcap.com.vn/api/price/symbols/getAll';
      const response = await axios.get(url, { headers: this.headers });

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch data: ${response.status} - ${response.statusText}`
        );
      }

      const jsonData = response.data;

      if (showLog) {
        logger.info('Successfully retrieved stock listing data by exchange.');
      }

      let df = jsonData;

      if (toDataFrame) {
        if (!jsonData) {
          throw new Error('JSON data is empty or not provided.');
        }

        // Convert column names to snake_case and rename certain columns
        df = df.map((item) => {
          const newItem: Record<string, any> = {};
          Object.keys(item).forEach((key) => {
            let newKey = camelToSnake(key);
            if (newKey === 'ticker') newKey = 'symbol';
            if (newKey === 'board') newKey = 'exchange';
            newItem[newKey] = item[key];
          });
          return newItem;
        });

        // Reorder columns to have 'symbol' first
        df = df.map((item) => {
          const { symbol, ...rest } = item;
          return { symbol, ...rest };
        });

        // Add metadata
        Object.defineProperty(df, 'source', { value: 'VCI' });
        return df;
      } else {
        return JSON.stringify(df);
      }
    } catch (error) {
      logger.error(`Error retrieving symbols by exchange: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve symbols by predefined groups
   */
  public async symbolsByGroup(options: GroupListingOptions): Promise<any> {
    const { group = 'VN30', showLog = false, toDataFrame = true } = options;

    if (!Object.keys(GROUP_CODE).includes(group)) {
      throw new Error(
        `Invalid group. Group must be one of: ${Object.keys(GROUP_CODE).join(
          ', '
        )}`
      );
    }

    try {
      const url = `https://mt.vietcap.com.vn/api/price/symbols/getByGroup?group=${group}`;
      const response = await axios.get(url, { headers: this.headers });

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch data: ${response.status} - ${response.statusText}`
        );
      }

      const jsonData = response.data;

      if (showLog) {
        logger.info('Successfully retrieved symbol listing data by group.');
      }

      let df = jsonData;

      if (toDataFrame) {
        if (!jsonData) {
          throw new Error('JSON data is empty or not provided.');
        }

        // Add metadata
        Object.defineProperty(df, 'source', { value: 'VCI' });

        // Return only symbols array
        return df.map((item) => item.symbol);
      } else {
        return JSON.stringify(df);
      }
    } catch (error) {
      logger.error(`Error retrieving symbols by group: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve all future index symbols
   */
  public async allFutureIndices(
    options: ListingMethodOptions = {}
  ): Promise<any> {
    return this.symbolsByGroup({ ...options, group: 'FU_INDEX' });
  }

  /**
   * Retrieve all government bond symbols
   */
  public async allGovernmentBonds(
    options: ListingMethodOptions = {}
  ): Promise<any> {
    return this.symbolsByGroup({ ...options, group: 'FU_BOND' });
  }

  /**
   * Retrieve all covered warrant symbols
   */
  public async allCoveredWarrant(
    options: ListingMethodOptions = {}
  ): Promise<any> {
    return this.symbolsByGroup({ ...options, group: 'CW' });
  }

  /**
   * Retrieve all bond symbols
   */
  public async allBonds(options: ListingMethodOptions = {}): Promise<any> {
    return this.symbolsByGroup({ ...options, group: 'BOND' });
  }
}
```

### Usage Example

```typescript
import { Listing } from 'vnstock-ts';

async function getListingData() {
  // Create a Listing instance
  const listing = new Listing({
    showLog: true,
  });

  try {
    // Get all stock symbols
    const allSymbols = await listing.allSymbols();
    console.log('All Symbols:', allSymbols.length);

    // Get symbols by industries
    const industriesSymbols = await listing.symbolsByIndustries();
    console.log('Industries Symbols:', industriesSymbols.length);

    // Get symbols by exchange
    const exchangeSymbols = await listing.symbolsByExchange();
    console.log('Exchange Symbols:', exchangeSymbols.length);

    // Get symbols for VN30 group
    const vn30Symbols = await listing.symbolsByGroup({ group: 'VN30' });
    console.log('VN30 Symbols:', vn30Symbols);

    // Get all future indices
    const futureIndices = await listing.allFutureIndices();
    console.log('Future Indices:', futureIndices);
  } catch (error) {
    console.error('Error fetching listing data:', error);
  }
}

getListingData();
```

## Dependencies

### Required Packages

- `axios`: For making HTTP requests
- Data processing utilities (for handling data transformations)

### Internal Dependencies

- `getHeaders` (from `core/utils/client`): To get appropriate headers for API requests
- `getLogger` (from `core/utils/logger`): For logging functionality
- `camelToSnake` (from `core/utils/parser`): For converting column names
- `GROUP_CODE` (from `./const`): Constants for group codes

## Implementation Notes

1. **Data Structure Differences**:

   - Python uses pandas DataFrames while TypeScript uses arrays of objects
   - DataFrame metadata attributes in Python become defined properties in TypeScript

2. **HTTP Requests**:

   - Replace Python's requests library with axios in TypeScript
   - Implement proper error handling with try/catch blocks

3. **Data Transformation**:

   - Implement utility functions for data cleaning and transformation
   - Handle column renaming and reordering

4. **Naming Conventions**:

   - Follow TypeScript conventions (camelCase) for method names
   - Adjust parameter names to be more TypeScript idiomatic (e.g., `to_df` → `toDataFrame`)

5. **Error Handling**:

   - Implement robust error handling with specific error messages
   - Validate inputs and outputs

6. **Async Operations**:
   - All methods return Promises to handle asynchronous API calls
   - Use async/await for cleaner code

By following this implementation guide, you should be able to create an equivalent TypeScript version of the VCI Listing module that provides the same functionality with a more idiomatic TypeScript interface.
