# VCI Company Implementation

## Overview

The `company.py` file contains the `Company` class which provides functions to retrieve company information from the VCI data source. This includes company overview, shareholders, officers, subsidiaries, affiliates, news, events, reports, trading statistics, and financial ratios.

## Class: Company

### Purpose

Provides access to company information and data from the VCI data source.

### Constructor Parameters

- `symbol` (required): Stock symbol to query (e.g., "VCB", "HPG")
- `random_agent` (optional): Boolean flag to use a random user agent for requests. Default is `false`.
- `to_df` (optional): Boolean flag to return data as DataFrame. Default is `true`.
- `show_log` (optional): Boolean flag to show detailed logs. Default is `false`.

### Properties

- `symbol`: The stock symbol (uppercase)
- `asset_type`: The asset type determined by the symbol
- `headers`: HTTP headers for API requests
- `show_log`: Boolean flag for logging
- `to_df`: Boolean flag for returning data as DataFrame
- `raw_data`: Raw data fetched from the API

### Methods

#### Private Methods

##### `_fetch_data()`

Fetches company data from the VCI GraphQL API.

- Returns: Record<string, any> - Raw data about the company from the API
- Throws: Error if the API request fails

##### `_process_data(data, data_key, columns_dict)`

Processes company data from the VCI API and converts it to a structured format.

- Parameters:
  - `data`: Record<string, any> - Data from the VCI API
  - `data_key`: string - Key of the data to process
  - `columns_dict`: Record<string, string> (optional) - Dictionary of columns to rename
- Returns: Object - Processed data

##### `_parse_price_info()`

Parses price and financial ratio data from the ticker price information.

- Returns: [price_data, ratio_data] - Tuple of price data and financial ratio data

#### Public Methods

##### `overview()`

Retrieves overview information about the company.

- Returns: Object with company overview data including profile, industry, and basic metrics

##### `shareholders()`

Retrieves information about the company's shareholders.

- Returns: Object with shareholder data including names, ownership percentages, and update dates

##### `officers(filter_by)`

Retrieves information about the company's officers.

- Parameters:
  - `filter_by` (optional): string - Filter officers by status. Values: "working", "resigned", "all". Default is "working".
- Returns: Object with officer data including names, positions, ownership percentages, and update dates
- Throws: Error if `filter_by` is not a valid value

##### `subsidiaries(filter_by)`

Retrieves information about the company's subsidiaries.

- Parameters:
  - `filter_by` (optional): string - Filter subsidiaries. Values: "all", "subsidiary". Default is "all".
- Returns: Object with subsidiary data including names and ownership percentages
- Throws: Error if `filter_by` is not a valid value

##### `affiliate()`

Retrieves information about the company's affiliates.

- Returns: Object with affiliate data including names and ownership percentages

##### `news()`

Retrieves news related to the company.

- Returns: Object with news data including titles, dates, and content

##### `events()`

Retrieves events related to the company.

- Returns: Object with event data including titles, dates, and details

##### `reports()`

Retrieves analysis reports about the company.

- Returns: Object with report data including names, dates, and links

##### `trading_stats()`

Retrieves trading statistics for the company.

- Returns: Object with trading data including price, volume, and foreign ownership

##### `ratio_summary()`

Retrieves a summary of financial ratios for the company.

- Returns: Object with financial ratios including PE, ROE, EPS, etc.

## Implementation Details

### Data Flow

1. User creates a `Company` instance with a stock symbol
2. The constructor validates the symbol and initializes connection parameters
3. The constructor fetches raw data from the VCI GraphQL API
4. Methods process specific segments of the raw data to return structured information
5. Data is optionally transformed before being returned to the user

### GraphQL API

The module uses a GraphQL API endpoint to fetch all company data in a single request. The GraphQL query includes:

- Company profile and listing information
- Price information
- Financial ratios
- Shareholders
- Officers (working and resigned)
- Subsidiaries and affiliates
- News and events
- Analysis reports

### Data Transformation

- Data is cleaned by removing HTML tags and formatting text
- Column names are converted from camelCase to snake_case
- Timestamps are converted to date strings
- Nested data structures are flattened
- Column names are standardized for clarity

### Error Handling

- Symbol validation ensures only stock symbols are accepted
- Input validation ensures parameters are valid
- HTTP request errors are caught and formatted for the user

### Dependencies

- In Python:
  - pandas
  - json
  - typing
  - Custom utilities: logger, market, parser, client, user_agent, transform
  - vnai.optimize_execution (optional optimization decorator)

## TypeScript Implementation Example

```typescript
/**
 * Company class for retrieving company information from VCI
 */
export class Company {
  private symbol: string;
  private assetType: string;
  private headers: Record<string, string>;
  private showLog: boolean;
  private toJson: boolean;
  private rawData: Record<string, any>;

  /**
   * Creates a new Company instance
   * @param symbol Stock symbol
   * @param randomAgent Whether to use a random user agent
   * @param toJson Whether to return data as JSON
   * @param showLog Whether to show detailed logs
   */
  constructor(
    symbol: string,
    randomAgent: boolean = false,
    toJson: boolean = false,
    showLog: boolean = false
  ) {
    this.symbol = symbol.toUpperCase();
    this.assetType = getAssetType(this.symbol);
    this.headers = getHeaders('VCI', randomAgent);
    this.showLog = showLog;
    this.toJson = toJson;

    // Validate symbol is a stock
    if (this.assetType !== 'stock') {
      throw new Error('Invalid symbol. Only stocks have company information.');
    }

    if (!showLog) {
      logger.setLevel(LogLevel.CRITICAL);
    }

    // Fetch the raw data
    this.rawData = this.fetchData();
  }

  /**
   * Fetches company data from the VCI GraphQL API
   * @returns Raw data about the company
   */
  private fetchData(): Record<string, any> {
    const url = _GRAPHQL_URL;

    // GraphQL query for company data
    // Create the query payload with the symbol
    const payload = {
      query: `query Query($ticker: String!, $lang: String!) {
        // GraphQL query content here
      }`,
      variables: {
        ticker: this.symbol,
        lang: 'vi',
      },
    };

    if (this.showLog) {
      logger.debug(`Requesting data for ${this.symbol} from ${url}`);
    }

    // Send the request
    const responseData = sendRequest({
      url,
      headers: this.headers,
      method: 'POST',
      data: payload,
      showLog: this.showLog,
    });

    return responseData.data;
  }

  /**
   * Processes company data from the VCI API
   * @param data Data from the VCI API
   * @param dataKey Key of the data to process
   * @param columnsDict Dictionary of columns to rename
   * @returns Processed data
   */
  private processData(
    data: Record<string, any>,
    dataKey: string,
    columnsDict?: Record<string, string>
  ): any {
    const segmentData = data[dataKey];

    // Transform to desired format
    // ... implementation details ...

    return processedData;
  }

  /**
   * Retrieves overview information about the company
   * @returns Company overview data
   */
  public overview(): any {
    const data = this.rawData['CompanyListingInfo'];
    // Process the data
    // ... implementation details ...

    return processedData;
  }

  /**
   * Retrieves information about the company's shareholders
   * @returns Shareholder data
   */
  public shareholders(): any {
    // ... implementation details ...
  }

  /**
   * Retrieves information about the company's officers
   * @param filterBy Filter officers by status
   * @returns Officer data
   */
  public officers(filterBy: string = 'working'): any {
    if (!['working', 'resigned', 'all'].includes(filterBy)) {
      throw new Error("filterBy must be 'working', 'resigned', or 'all'");
    }

    // ... implementation details ...
  }

  // Additional method implementations...
}
```

## Constants Required

This module depends on several constants that should be defined in the `const.ts` file:

- `_GRAPHQL_URL`: URL for the GraphQL API endpoint
- `_PRICE_INFO_MAP`: Mapping of price info fields from API to standard field names

## Utility Functions Required

The module depends on these utility functions:

- `getLogger`: Creates a logger instance
- `getAssetType`: Determines asset type from symbol
- `getHeaders`: Generates HTTP headers
- `sendRequest`: Makes HTTP requests
- `camelToSnake`: Converts camelCase to snake_case
- `cleanHtmlDict`: Cleans HTML tags from dictionary values
- `flattenDictToObject`: Flattens nested dictionary structure
- `flattenListToObject`: Flattens list of objects
- `reorderColumns`: Reorders columns in an object
- `dropColumnsByPattern`: Removes columns matching patterns

## Notes on TypeScript Implementation

1. In TypeScript, instead of using pandas DataFrames, we can:

   - Use plain JavaScript objects with array and object transformations
   - Consider using a library like Danfo.js for DataFrame-like functionality
   - Implement custom data transformation utilities

2. GraphQL queries should be properly formatted in the TypeScript code

3. For date handling, consider using libraries like dayjs or date-fns

4. For data cleaning and transformation, implement utility functions equivalent to the Python ones

5. Consider implementing an interface for the returned data structures to provide strong typing
