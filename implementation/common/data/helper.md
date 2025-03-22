# Implementation of Data Helper Functions

**Original Python Implementation**: [helper.py](/vnstock/common/data/helper.py)


## Overview

The `vnstock` package includes various helper functions and utilities for data manipulation, extraction, and processing that are used across different modules. While there isn't a dedicated `helper.py` file in the `common/data` directory, these functions are distributed throughout the codebase, particularly in the core utilities and data explorer modules. This document consolidates the documentation for these helper functions to provide a comprehensive reference.

## MSN Data Helpers

### API Key Retrieval

Helper functions for retrieving API keys and parameters from the MSN finance data source.

#### Python Implementation

```python
# From vnstock/explorer/msn/helper.py
def msn_apikey(headers, version='20240430', show_log=False):
    """
    Lấy apikey của MSN để sử dụng cho các truy vấn dữ liệu

    Tham số:
        - headers (bắt buộc): Header của request.
        - version (tùy chọn): Phiên bản của apikey, thường là giá trị ngày tháng của hôm đó, ví dụ 20240527. Mặc định là None.
        - show_log (tùy chọn): Hiển thị thông tin log giúp debug dễ dàng. Mặc định là False.
    """
    scope = """{"audienceMode":"adult",
                        "browser":{"browserType":"chrome","version":"0","ismobile":"false"},
                        "deviceFormFactor":"desktop","domain":"www.msn.com",
                        "locale":{"content":{"language":"vi","market":"vn"},"display":{"language":"vi","market":"vn"}},
                        "ocid":"hpmsn","os":"macos","platform":"web",
                        "pageType":"financestockdetails"}
                        """
    if version is None:
        today = (datetime.now()-timedelta(hours=7)).strftime("%Y%m%d")
        version = today

    url = f"https://assets.msn.com/resolver/api/resolve/v3/config/?expType=AppConfig&expInstance=default&apptype=finance&v={version}.130&targetScope={scope}"
    if show_log:
        logger.info(f"Requesting apikey from {url}")
    response = requests.request("GET", url, headers=headers)
    data = response.json()
    if show_log:
        logger.info(f"Response: {data}")
    apikey = data['configs']["shared/msn-ns/HoroscopeAnswerCardWC/default"]["properties"]["horoscopeAnswerServiceClientSettings"]["apikey"]
    return apikey
```

### Asset Type Detection

Functions to determine the asset type from a given symbol or identifier.

#### Python Implementation

```python
# From vnstock/explorer/msn/helper.py
def get_asset_type(symbol_id):
    if symbol_id in _CURRENCY_ID_MAP.values():
        return "currency"
    elif symbol_id in _CRYPTO_ID_MAP.values():
        return "crypto"
    elif symbol_id in _GLOBAL_INDICES.values():
        return "index"
    else:
        return "Unknown"
```

## Data Transformation Helpers

### OHLC Data Processing

Functions for transforming Open-High-Low-Close (OHLC) price data.

#### Python Implementation

```python
# From vnstock/core/utils/transform.py
def ohlc_to_df(data: Union[List[Dict[str, Any]], Dict[str, Any]],
               column_map: Dict[str, str], dtype_map: Dict[str, str],
               asset_type: str, symbol: str, source: str, interval: str,
               floating: int = 2, resample_map: Optional[Dict[str, str]] = None) -> pd.DataFrame:
    """
    Convert OHLC (Open, High, Low, Close) data from API to standardized DataFrame format.

    Parameters:
        data: List of dictionary data from API or a single dictionary
        column_map: Mapping from source columns to standard column names
        dtype_map: Data types for each column
        asset_type: Asset type (stock, derivative, etc.)
        symbol: Trading symbol
        source: Data source identifier (VCI, TCBS, etc.)
        interval: Time interval (1D, 1W, etc.)
        floating: Number of decimal places for floating point values
        resample_map: Optional mapping for resampling data to different intervals

    Returns:
        DataFrame with standardized format and timezone-aware timestamps
    """
    # Implementation...
```

### Intraday Data Processing

Functions for transforming intraday trading data.

#### Python Implementation

```python
# From vnstock/core/utils/transform.py
def intraday_to_df(data: List[Dict[str, Any]], column_map: Dict[str, str],
                  dtype_map: Dict[str, str], symbol: str, asset_type: str,
                  source: str) -> pd.DataFrame:
    """
    Convert intraday trading data to standardized DataFrame format.

    Parameters:
        data: List of dictionary data from API
        column_map: Mapping from source columns to standard column names
        dtype_map: Data types for each column
        symbol: Trading symbol
        asset_type: Asset type (stock, derivative, etc.)
        source: Data source identifier (VCI, TCBS, etc.)

    Returns:
        DataFrame with standardized format and timezone-aware timestamps
    """
    # Implementation...
```

### Match Type Processing

Processing functions for trade match types.

#### Python Implementation

```python
# From vnstock/core/utils/transform.py
def process_match_types(df: pd.DataFrame, asset_type: str, source: str) -> pd.DataFrame:
    """
    Process and standardize match types in trading data.

    Parameters:
        df: DataFrame with a 'matchType' column
        asset_type: Asset type (stock, derivative, etc.)
        source: Data source identifier (VCI, TCBS, etc.)

    Returns:
        DataFrame with processed match types
    """
    # Implementation...
```

## Date and Time Helpers

### Trading Date Processing

Functions for working with trading dates and market sessions.

#### Python Implementation

```python
# From vnstock/core/utils/transform.py
def get_trading_date(dt: Optional[datetime] = None) -> str:
    """
    Get the current or nearest past trading date.

    Parameters:
        dt: Optional datetime, defaults to current time

    Returns:
        Trading date in YYYY-MM-DD format
    """
    # Implementation...
```

## TypeScript Implementation

### API Key Retrieval

```typescript
/**
 * Retrieve MSN Finance API key
 *
 * @param options - Configuration options
 * @returns API key string
 */
export async function getMsnApiKey({
  version = format(new Date(), 'yyyyMMdd'),
  showLog = false,
}: {
  version?: string;
  showLog?: boolean;
}): Promise<string> {
  const logger = getLogger('msn.helper');

  const scope = JSON.stringify({
    audienceMode: 'adult',
    browser: { browserType: 'chrome', version: '0', ismobile: 'false' },
    deviceFormFactor: 'desktop',
    domain: 'www.msn.com',
    locale: {
      content: { language: 'vi', market: 'vn' },
      display: { language: 'vi', market: 'vn' },
    },
    ocid: 'hpmsn',
    os: 'macos',
    platform: 'web',
    pageType: 'financestockdetails',
  });

  const url = `https://assets.msn.com/resolver/api/resolve/v3/config/?expType=AppConfig&expInstance=default&apptype=finance&v=${version}.130&targetScope=${encodeURIComponent(
    scope
  )}`;

  if (showLog) {
    logger.info(`Requesting apikey from ${url}`);
  }

  try {
    const response = await fetch(url, {
      headers: getHeaders('MSN'),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch API key: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (showLog) {
      logger.info(`Response received`);
    }

    return data.configs['shared/msn-ns/HoroscopeAnswerCardWC/default']
      .properties.horoscopeAnswerServiceClientSettings.apikey;
  } catch (error) {
    logger.error(`Error fetching MSN API key: ${error.message}`);
    throw error;
  }
}

/**
 * Determine asset type from symbol ID
 *
 * @param symbolId - MSN symbol identifier
 * @returns Asset type string
 */
export function getAssetType(symbolId: string): string {
  const currencyIds = Object.values(CURRENCY_ID_MAP);
  const cryptoIds = Object.values(CRYPTO_ID_MAP);
  const indexIds = Object.values(GLOBAL_INDICES);

  if (currencyIds.includes(symbolId)) {
    return 'currency';
  } else if (cryptoIds.includes(symbolId)) {
    return 'crypto';
  } else if (indexIds.includes(symbolId)) {
    return 'index';
  } else {
    return 'Unknown';
  }
}
```

### OHLC Data Processing

```typescript
/**
 * Convert OHLC data to standardized format
 */
export function ohlcToDataArray(
  data: any,
  options: OHLCTransformOptions
): OHLCDataPoint[] {
  const {
    columnMap,
    dtypeMap,
    assetType,
    symbol,
    source,
    interval,
    floating = 2,
    resampleMap = null,
  } = options;

  // Input validation
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return [];
  }

  // Handle different data source formats
  let rawData: any[];
  if (source === 'TCBS') {
    // TCBS data is already in a specific format
    rawData = Array.isArray(data) ? data : [data];
  } else {
    // VCI and other sources may need different handling
    rawData = Array.isArray(data.data)
      ? data.data
      : data.data
      ? [data.data]
      : [];
  }

  // Map data to standardized format
  const result = rawData.map((item) => {
    const newItem: Record<string, any> = {};

    // Map each field from the original data to our standard format
    Object.entries(columnMap).forEach(([sourceKey, targetKey]) => {
      if (item[sourceKey] !== undefined) {
        let value = item[sourceKey];

        // Process based on data type
        if (dtypeMap[targetKey] === 'float') {
          value = parseFloat(formatNumber(value, floating));
        } else if (dtypeMap[targetKey] === 'int') {
          value = parseInt(value, 10);
        } else if (dtypeMap[targetKey] === 'datetime') {
          // Convert to standardized timestamp
          if (typeof value === 'number') {
            // If timestamp is in seconds
            value = new Date(value * 1000).toISOString();
          } else if (typeof value === 'string') {
            value = new Date(value).toISOString();
          }
        }

        newItem[targetKey] = value;
      }
    });

    // Add metadata
    newItem.symbol = symbol;
    newItem.source = source;
    newItem.asset_type = assetType;
    newItem.interval = interval;

    return newItem as OHLCDataPoint;
  });

  // Sort by time
  return result.sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeA - timeB;
  });
}
```

### Intraday Data Processing

```typescript
/**
 * Convert intraday trading data to standardized format
 */
export function intradayToDataArray(
  data: any[],
  options: IntradayTransformOptions
): IntradayDataPoint[] {
  const { columnMap, dtypeMap, symbol, assetType, source } = options;

  // Early exit if no data
  if (!data || data.length === 0) {
    return [];
  }

  // Create standardized data points
  let result = data.map((item) => {
    const newItem: Record<string, any> = {};

    // Map columns using columnMap
    Object.entries(columnMap).forEach(([sourceKey, targetKey]) => {
      if (item[sourceKey] !== undefined) {
        newItem[targetKey] = item[sourceKey];
      }
    });

    return newItem as IntradayDataPoint;
  });

  // Handle time formatting based on source
  result.forEach((item) => {
    if (item.time) {
      const tradingDate = getTradingDate();

      if (source === 'VCI') {
        // VCI provides timestamps in seconds
        item.time = new Date(parseInt(item.time, 10) * 1000).toISOString();
      } else {
        // TCBS and others might provide time in various formats
        const timeStr = String(item.time);

        if (timeStr.includes(':') && timeStr.length <= 8) {
          // Time-only values (HH:MM:SS), combine with trading date
          const [hours, minutes, seconds = '0'] = timeStr.split(':');
          const dateTime = new Date(tradingDate);
          dateTime.setHours(parseInt(hours, 10));
          dateTime.setMinutes(parseInt(minutes, 10));
          dateTime.setSeconds(parseInt(seconds, 10));
          item.time = dateTime.toISOString();
        } else {
          // Parse as full datetime
          item.time = new Date(item.time).toISOString();
        }
      }
    }
  });

  // Process match types if present
  if (result.length > 0 && 'matchType' in result[0]) {
    result = processMatchTypes(result, assetType, source);
  }

  // Sort by time
  result.sort((a, b) => {
    if (!a.time) return -1;
    if (!b.time) return 1;
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  // Add metadata
  result.forEach((item) => {
    item.symbol = symbol;
    item.asset_type = assetType;
    item.source = source;
  });

  return result;
}
```

### Trading Date Processing

```typescript
/**
 * Get the current or nearest past trading date
 *
 * @param date - Optional date to use instead of current date
 * @returns Date string in YYYY-MM-DD format
 */
export function getTradingDate(date?: Date): string {
  const today = date || new Date();
  const dayOfWeek = today.getDay();

  // If Sunday (0) or Saturday (6), adjust to Friday
  if (dayOfWeek === 0) {
    // Sunday, go back 2 days to Friday
    const friday = new Date(today);
    friday.setDate(today.getDate() - 2);
    return format(friday, 'yyyy-MM-dd');
  } else if (dayOfWeek === 6) {
    // Saturday, go back 1 day to Friday
    const friday = new Date(today);
    friday.setDate(today.getDate() - 1);
    return format(friday, 'yyyy-MM-dd');
  }

  // Weekday, use current date
  return format(today, 'yyyy-MM-dd');
}
```

## Validation and Mapping

Various helper functions for validating and mapping data.

```typescript
/**
 * Validate a symbol against a list of available symbols
 *
 * @param symbol Symbol to validate
 * @param availableSymbols List of available symbols
 * @returns True if valid, false otherwise
 */
export function isValidSymbol(
  symbol: string,
  availableSymbols: string[]
): boolean {
  return availableSymbols.includes(symbol.toUpperCase());
}

/**
 * Map a symbol from one format to another using a mapping dictionary
 *
 * @param symbol Original symbol
 * @param symbolMap Mapping dictionary
 * @returns Mapped symbol or the original if not found
 */
export function mapSymbol(
  symbol: string,
  symbolMap: Record<string, string>
): string {
  return symbolMap[symbol.toUpperCase()] || symbol;
}
```

## Implementation Details

### Functionality by Category

1. **Data Transformation**:

   - Converting raw API data to standardized formats
   - Processing and normalizing different data structures
   - Handling different date/time formats

2. **Symbol Management**:

   - Identifying asset types from symbols
   - Mapping symbols between different data sources
   - Validating symbols against available lists

3. **API Utilities**:

   - Retrieving API keys and authentication tokens
   - Formatting API request parameters
   - Processing API responses

4. **Date/Time Processing**:
   - Determining trading dates
   - Handling timezone conversions
   - Formatting date ranges for queries

### Dependencies

These helper functions depend on various libraries:

- **Python**:

  - `pandas` - For data manipulation
  - `requests` - For HTTP requests
  - `datetime` - For date/time handling
  - Vnstock core utilities - For logging, parsing, etc.

- **TypeScript**:
  - `date-fns` - For date manipulation
  - `lodash` - For utility functions
  - Custom logger implementation
  - TypeScript interfaces for data structures

## Usage Examples

### Python Example

```python
from vnstock.explorer.msn.helper import msn_apikey, get_asset_type
from vnstock.core.utils.user_agent import get_headers

# Get MSN API key
headers = get_headers('MSN')
api_key = msn_apikey(headers, show_log=True)

# Check asset type
asset_type = get_asset_type('BTC-USD')
```

### TypeScript Example

```typescript
import { getMsnApiKey, getAssetType } from './msn/helper';
import { ohlcToDataArray } from './transform';

// Get MSN API key
const apiKey = await getMsnApiKey({ showLog: true });

// Transform OHLC data
const rawData = await fetchOhlcData('VNM');
const processedData = ohlcToDataArray(rawData, {
  columnMap: {
    t: 'time',
    o: 'open',
    h: 'high',
    l: 'low',
    c: 'close',
    v: 'volume',
  },
  dtypeMap: {
    time: 'datetime',
    open: 'float',
    high: 'float',
    low: 'float',
    close: 'float',
    volume: 'int',
  },
  assetType: 'stock',
  symbol: 'VNM',
  source: 'VCI',
  interval: '1D',
});
```

## Implementation Notes

1. **Maintainability**:

   - Helper functions are designed to be self-contained with minimal dependencies
   - Functions include comprehensive documentation and type hints
   - Each function handles a specific task to maintain separation of concerns

2. **Performance**:

   - Data transformation functions are optimized for handling large datasets
   - Many functions implement early returns to avoid unnecessary processing
   - Some functions cache results or use memoization for repeated calls

3. **Error Handling**:

   - Functions include appropriate error handling and error messages
   - Helper functions validate inputs to prevent downstream errors
   - Most functions gracefully handle edge cases like empty datasets

4. **TypeScript Implementation**:
   - TypeScript versions include proper typing for all parameters and return values
   - Async functions are properly implemented with Promise returns
   - Error handling follows TypeScript best practices
     </rewritten_file>
