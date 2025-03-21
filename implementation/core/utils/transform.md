# Implementation of Transform Module (Core Utilities)

## Overview

The `transform.py` module in the Python `vnstock` package provides essential data transformation utilities used throughout the package. These utilities handle various tasks such as converting API responses to standardized DataFrame formats, flattening nested data structures, cleaning HTML content from API responses, and handling timezone-aware timestamps. The module serves as a critical foundation for processing financial data consistently across different data sources.

## Functions and Methods

### 1. `get_trading_date()`

Determines the appropriate trading date based on the current day and time in Vietnam timezone.

#### Python Implementation

```python
def get_trading_date() -> datetime.date:
    """
    Determine the appropriate trading date based on current day and time in Vietnam timezone.

    Returns:
        - datetime.date: The appropriate trading date to use
    """
    # Get current time in Vietnam timezone
    now = datetime.now(vietnam_tz)
    weekday = now.weekday()  # Monday is 0, Sunday is 6
    current_time = now.time()

    if weekday >= 5:  # Weekend (Saturday or Sunday)
        # Calculate days to previous Friday
        days_to_subtract = weekday - 4
        return (now - timedelta(days=days_to_subtract)).date()
    elif weekday == 0 and current_time < time(8, 30):
        # Monday before 8:30 AM
        return (now - timedelta(days=3)).date()  # Previous Friday
    else:
        # Regular trading day
        return now.date()
```

### 2. `process_match_types(df, asset_type, source)`

Processes match type labels with special handling for stock ATO/ATC transactions.

#### Python Implementation

```python
def process_match_types(df, asset_type, source):
    """
    Process match_type labels with special handling for stock ATO/ATC transactions.
    """
    # Basic replacement - applies to all asset types
    if source == 'VCI':
        df['match_type'] = df['match_type'].replace({'b': 'Buy', 's': 'Sell'})
    elif source == 'TCBS':
        df['match_type'] = df['match_type'].replace({'BU': 'Buy', 'SD': 'Sell'})

    # Only process ATO/ATC for stock assets
    if asset_type == 'stock' and (
        ('unknown' in df['match_type'].values and source == 'VCI') or
        ('' in df['match_type'].values and source == 'TCBS')
    ):
        # Sort by time to ensure correct order
        df = df.sort_values('time')

        # Create a date column for grouping by trading day
        df['date'] = df['time'].dt.date

        # Process each trading day separately
        for date in df['date'].unique():
            day_mask = df['date'] == date

            # Create unknown mask based on source
            if source == 'VCI':
                unknown_mask = (df['match_type'] == 'unknown') & day_mask
            else:  # TCBS
                unknown_mask = (df['match_type'] == '') & day_mask

            unknown_indices = df[unknown_mask].index

            if len(unknown_indices) > 0:
                # Morning session: Find transactions around 9:15 AM (9:13-9:17)
                morning_mask = unknown_mask & (df['time'].dt.hour == 9) & (df['time'].dt.minute >= 13) & (df['time'].dt.minute <= 17)
                morning_indices = df[morning_mask].index

                # Afternoon session: Find transactions around 2:45 PM (14:43-14:47)
                afternoon_mask = unknown_mask & (df['time'].dt.hour == 14) & (df['time'].dt.minute >= 43) & (df['time'].dt.minute <= 47)
                afternoon_indices = df[afternoon_mask].index

                # Label ATO for first morning session transaction
                if len(morning_indices) > 0:
                    ato_idx = df.loc[morning_indices, 'time'].idxmin()
                    df.loc[ato_idx, 'match_type'] = 'ATO'

                # Label ATC for last afternoon session transaction
                if len(afternoon_indices) > 0:
                    atc_idx = df.loc[afternoon_indices, 'time'].idxmax()
                    df.loc[atc_idx, 'match_type'] = 'ATC'

        # Remove the temporary date column
        df = df.drop(columns=['date'])

    return df
```

### 3. `ohlc_to_df(data, column_map, dtype_map, asset_type, symbol, source, interval, floating, resample_map)`

Converts OHLC (Open, High, Low, Close) price data from different sources into a standardized DataFrame format.

#### Python Implementation

```python
def ohlc_to_df(data: Dict[str, Any], column_map: Dict[str, str], dtype_map: Dict[str, str],
              asset_type: str, symbol: str, source: str, interval: str = "1D",
              floating: int = 2, resample_map: Optional[Dict[str, str]] = None) -> pd.DataFrame:
    """Convert OHLC data from any source to standardized DataFrame format."""
    if not data:
        raise ValueError("Input data is empty or not provided.")

    # Handle different data source formats
    if source == 'TCBS':
        # TCBS data is already a list of dictionaries
        df = pd.DataFrame(data)
        # Apply column mapping directly through rename
        df.rename(columns=column_map, inplace=True)
    else:
        # VCI and other sources
        # Select and rename columns using dictionary comprehension
        columns_of_interest = {key: column_map[key] for key in column_map.keys() if key in data}
        df = pd.DataFrame(data)[columns_of_interest.keys()].rename(columns=column_map)

    # Ensure all required columns exist
    required_columns = ['time', 'open', 'high', 'low', 'close', 'volume']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}. Available columns: {df.columns.tolist()}")

    # Standard column order
    df = df[['time', 'open', 'high', 'low', 'close', 'volume']]

    # Time conversion - handle different formats based on source
    if 'time' in df.columns:
        if source == 'VCI':
            # VCI uses integer timestamps
            df['time'] = pd.to_datetime(df['time'].astype(int), unit='s').dt.tz_localize('UTC')
            df['time'] = df['time'].dt.tz_convert('Asia/Ho_Chi_Minh')
        else:
            # TCBS and others might use string formats
            df['time'] = pd.to_datetime(df['time'], errors='coerce')

    # Price scaling for non-index/derivative assets
    if asset_type not in ["index", "derivative"]:
        df[["open", "high", "low", "close"]] = df[["open", "high", "low", "close"]].div(1000)

    # Round price columns
    df[["open", "high", "low", "close"]] = df[["open", "high", "low", "close"]].round(floating)

    # Resample if needed
    if resample_map and interval not in ["1m", "1H", "1D"]:
        df = df.set_index('time').resample(resample_map[interval]).agg({
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum'
        }).reset_index()

    # Apply data types
    for col, dtype in dtype_map.items():
        if col in df.columns:
            if dtype == "datetime64[ns]" and hasattr(df[col], 'dt') and df[col].dt.tz is not None:
                df[col] = df[col].dt.tz_localize(None)  # Remove timezone info
                if interval == "1D":
                    df[col] = df[col].dt.date
            df[col] = df[col].astype(dtype)

    # Add metadata
    df.name = symbol
    df.category = asset_type
    df.source = source

    return df
```

### 4. `intraday_to_df(data, column_map, dtype_map, symbol, asset_type, source)`

Converts intraday trading data to a standardized DataFrame format.

#### Python Implementation

```python
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
    # Early exit if no data
    if not data:
        empty_df = pd.DataFrame(columns=list(column_map.values()))
        empty_df.attrs['symbol'] = symbol
        empty_df.category = asset_type
        empty_df.source = source
        return empty_df

    # Create DataFrame
    df = pd.DataFrame(data)

    # Select and rename columns
    available_columns = [col for col in column_map.keys() if col in df.columns]
    if not available_columns:
        raise ValueError(f"None of the expected columns found in data. Expected: {list(column_map.keys())}, Found: {df.columns.tolist()}")

    df = df[available_columns]
    df.rename(columns={k: column_map[k] for k in available_columns}, inplace=True)

    # Handle time column based on source
    if 'time' in df.columns:
        trading_date = get_trading_date()

        if source == 'VCI':
            # VCI provides timestamps - use localize_timestamp directly
            df['time'] = localize_timestamp(df['time'].astype(int), unit='s')
        else:  # TCBS
            # Check if we have just time values (HH:MM:SS)
            sample_time = str(df['time'].iloc[0]) if not df.empty else ''

            if ':' in sample_time and len(sample_time) <= 8:
                # Time-only values, combine with trading_date
                df['time'] = df['time'].apply(
                    lambda x: datetime.combine(trading_date, datetime.strptime(x, '%H:%M:%S').time())
                    if isinstance(x, str) and ':' in x else pd.NaT
                )
                # Use localize_timestamp to handle timezone
                df['time'] = localize_timestamp(df['time'], return_string=False)
            else:
                # Parse as full datetime, then localize
                df['time'] = pd.to_datetime(df['time'], format='%Y-%m-%d %H:%M:%S', errors='coerce')
                # Use localize_timestamp instead of manual localization
                if df['time'].dt.tz is None:
                    df['time'] = localize_timestamp(df['time'], return_string=False)

    # Process match types
    if 'match_type' in df.columns:
        df = process_match_types(df, asset_type, source)

    # Sort by time
    if 'time' in df.columns:
        df = df.sort_values('time')

    # Reset_index
    df = df.reset_index(drop=True)

    # Apply data types
    dtype_without_time = {k: v for k, v in dtype_map.items() if k != 'time' and k in df.columns}
    df = df.astype(dtype_without_time)

    # Add metadata
    df.attrs['symbol'] = symbol
    df.category = asset_type
    df.source = source

    return df
```

### 5. `flatten_hierarchical_index(df, separator, text_replacements, handle_duplicates, drop_levels, keep_levels)`

Flattens hierarchical multi-level column indices into a single level for easier handling.

### 6. `flatten_dict_to_df(data, nested_key)`

Converts a nested dictionary with financial data into a tabular DataFrame.

### 7. `flatten_list_to_df(data_list, nested_key)`

Converts a list of nested dictionaries into a tabular DataFrame.

### 8. `clean_html_dict(data, html_keys)`

Cleans HTML tags from dictionary values, particularly useful for API responses containing HTML-formatted text.

### 9. `reorder_cols(df, cols, position)`

Reorders columns in a DataFrame, moving specified columns to the beginning or end.

### 10. `drop_cols_by_pattern(df, patterns, regex, case_sensitive)`

Drops columns from a DataFrame that match specific patterns or regular expressions.

## TypeScript Implementation

### TypeScript Interfaces

```typescript
/**
 * Options for OHLC data conversion
 */
interface OhlcOptions {
  interval?: string;
  floating?: number;
  resampleMap?: Record<string, string>;
}

/**
 * Column mapping for data transformation
 */
interface ColumnMapping {
  [sourceColumn: string]: string;
}

/**
 * Data type mapping for columns
 */
interface DtypeMapping {
  [column: string]: string;
}

/**
 * Options for hierarchical index flattening
 */
interface FlattenOptions {
  separator?: string;
  textReplacements?: Record<string, string>;
  handleDuplicates?: boolean;
  dropLevels?: number[] | null;
  keepLevels?: number[] | null;
}
```

### TypeScript Implementation

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getLogger } from './logger';

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Vietnam timezone
const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

// Logger instance
const logger = getLogger('core.utils.transform');

/**
 * Determine the appropriate trading date based on current day and time in Vietnam timezone
 */
export function getTradingDate(): Date {
  // Get current time in Vietnam timezone
  const now = dayjs().tz(VIETNAM_TIMEZONE);
  const weekday = now.day(); // 0 is Sunday, 6 is Saturday in dayjs
  const currentHour = now.hour();
  const currentMinute = now.minute();

  if (weekday === 0 || weekday === 6) {
    // Weekend (Saturday or Sunday)
    // Calculate days to previous Friday
    const daysToSubtract = weekday === 0 ? 2 : 1;
    return now.subtract(daysToSubtract, 'day').startOf('day').toDate();
  } else if (
    weekday === 1 &&
    (currentHour < 8 || (currentHour === 8 && currentMinute < 30))
  ) {
    // Monday before 8:30 AM
    return now.subtract(3, 'day').startOf('day').toDate(); // Previous Friday
  } else {
    // Regular trading day
    return now.startOf('day').toDate();
  }
}

/**
 * Process match types in trading data with special handling for ATO/ATC
 */
export function processMatchTypes(
  data: any[],
  assetType: string,
  source: string
): any[] {
  // Create a copy to avoid modifying the original
  const result = [...data];

  // Basic replacement - applies to all asset types
  result.forEach((item) => {
    if (source === 'VCI' && item.matchType) {
      item.matchType =
        item.matchType === 'b'
          ? 'Buy'
          : item.matchType === 's'
          ? 'Sell'
          : item.matchType;
    } else if (source === 'TCBS' && item.matchType) {
      item.matchType =
        item.matchType === 'BU'
          ? 'Buy'
          : item.matchType === 'SD'
          ? 'Sell'
          : item.matchType;
    }
  });

  // Only process ATO/ATC for stock assets with unknown types
  if (assetType === 'stock') {
    const hasUnknown =
      source === 'VCI'
        ? result.some((item) => item.matchType === 'unknown')
        : result.some((item) => !item.matchType);

    if (hasUnknown) {
      // Sort by time to ensure correct order
      result.sort((a, b) => {
        const timeA = dayjs(a.time);
        const timeB = dayjs(b.time);
        return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
      });

      // Group by trading day
      const dayGroups: Record<string, any[]> = {};
      result.forEach((item) => {
        const dateKey = dayjs(item.time).format('YYYY-MM-DD');
        if (!dayGroups[dateKey]) {
          dayGroups[dateKey] = [];
        }
        dayGroups[dateKey].push(item);
      });

      // Process each trading day separately
      Object.values(dayGroups).forEach((dayItems) => {
        // Find unknown items based on source
        const unknownItems =
          source === 'VCI'
            ? dayItems.filter((item) => item.matchType === 'unknown')
            : dayItems.filter((item) => !item.matchType);

        if (unknownItems.length > 0) {
          // Morning session: Find transactions around 9:15 AM (9:13-9:17)
          const morningItems = unknownItems.filter((item) => {
            const time = dayjs(item.time);
            return (
              time.hour() === 9 && time.minute() >= 13 && time.minute() <= 17
            );
          });

          // Afternoon session: Find transactions around 2:45 PM (14:43-14:47)
          const afternoonItems = unknownItems.filter((item) => {
            const time = dayjs(item.time);
            return (
              time.hour() === 14 && time.minute() >= 43 && time.minute() <= 47
            );
          });

          // Label ATO for first morning session transaction
          if (morningItems.length > 0) {
            // Sort by time
            morningItems.sort((a, b) =>
              dayjs(a.time).isBefore(dayjs(b.time)) ? -1 : 1
            );
            morningItems[0].matchType = 'ATO';
          }

          // Label ATC for last afternoon session transaction
          if (afternoonItems.length > 0) {
            // Sort by time
            afternoonItems.sort((a, b) =>
              dayjs(a.time).isBefore(dayjs(b.time)) ? -1 : 1
            );
            afternoonItems[afternoonItems.length - 1].matchType = 'ATC';
          }
        }
      });
    }
  }

  return result;
}

/**
 * Convert OHLC data from any source to standardized format
 */
export function ohlcToDataArray(
  data: any,
  columnMap: ColumnMapping,
  dtypeMap: DtypeMapping,
  assetType: string,
  symbol: string,
  source: string,
  options: OhlcOptions = {}
): any[] {
  const { interval = '1D', floating = 2, resampleMap = null } = options;

  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error('Input data is empty or not provided.');
  }

  // Handle different data source formats
  let result: any[];

  if (source === 'TCBS') {
    // TCBS data is already a list of objects
    result = Array.isArray(data) ? [...data] : [data];
  } else {
    // VCI and other sources
    // Convert to array if needed
    result = Array.isArray(data)
      ? [...data]
      : typeof data === 'object'
      ? [data]
      : [];
  }

  // Map columns
  result = result.map((item) => {
    const newItem: Record<string, any> = {};

    // Map columns using columnMap
    Object.keys(columnMap).forEach((sourceKey) => {
      if (item[sourceKey] !== undefined) {
        const targetKey = columnMap[sourceKey];
        newItem[targetKey] = item[sourceKey];
      }
    });

    return newItem;
  });

  // Ensure all required fields exist
  const requiredFields = ['time', 'open', 'high', 'low', 'close', 'volume'];
  const missingFields = requiredFields.filter(
    (field) => result.length === 0 || result[0][field] === undefined
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Process time conversion
  result.forEach((item) => {
    if (item.time) {
      if (source === 'VCI') {
        // VCI uses integer timestamps
        item.time = dayjs
          .unix(parseInt(item.time, 10))
          .tz(VIETNAM_TIMEZONE)
          .toDate();
      } else {
        // TCBS and others might use string formats
        item.time = dayjs(item.time).toDate();
      }
    }
  });

  // Price scaling for non-index/derivative assets
  if (assetType !== 'index' && assetType !== 'derivative') {
    result.forEach((item) => {
      item.open = parseFloat((item.open / 1000).toFixed(floating));
      item.high = parseFloat((item.high / 1000).toFixed(floating));
      item.low = parseFloat((item.low / 1000).toFixed(floating));
      item.close = parseFloat((item.close / 1000).toFixed(floating));
    });
  } else {
    // Just round the values
    result.forEach((item) => {
      item.open = parseFloat(item.open.toFixed(floating));
      item.high = parseFloat(item.high.toFixed(floating));
      item.low = parseFloat(item.low.toFixed(floating));
      item.close = parseFloat(item.close.toFixed(floating));
    });
  }

  // Add metadata
  result.forEach((item) => {
    item._symbol = symbol;
    item._category = assetType;
    item._source = source;
  });

  // Sorting by time
  result.sort((a, b) => {
    const timeA = dayjs(a.time);
    const timeB = dayjs(b.time);
    return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
  });

  return result;
}

/**
 * Convert intraday trading data to standardized format
 */
export function intradayToDataArray(
  data: any[],
  columnMap: ColumnMapping,
  dtypeMap: DtypeMapping,
  symbol: string,
  assetType: string,
  source: string
): any[] {
  // Early exit if no data
  if (!data || data.length === 0) {
    return [];
  }

  // Create a new array with mapped properties
  let result = data.map((item) => {
    const newItem: Record<string, any> = {};

    // Map columns using columnMap
    Object.keys(columnMap).forEach((sourceKey) => {
      if (item[sourceKey] !== undefined) {
        const targetKey = columnMap[sourceKey];
        newItem[targetKey] = item[sourceKey];
      }
    });

    return newItem;
  });

  // Handle time column based on source
  result.forEach((item) => {
    if (item.time) {
      const tradingDate = getTradingDate();

      if (source === 'VCI') {
        // VCI provides timestamps
        item.time = dayjs
          .unix(parseInt(item.time, 10))
          .tz(VIETNAM_TIMEZONE)
          .toDate();
      } else {
        // TCBS
        // Check if we have just time values (HH:MM:SS)
        const timeStr = String(item.time);

        if (timeStr.includes(':') && timeStr.length <= 8) {
          // Time-only values, combine with trading date
          const [hours, minutes, seconds] = timeStr.split(':').map(Number);

          item.time = dayjs(tradingDate)
            .hour(hours || 0)
            .minute(minutes || 0)
            .second(seconds || 0)
            .tz(VIETNAM_TIMEZONE)
            .toDate();
        } else {
          // Parse as full datetime
          item.time = dayjs(item.time).tz(VIETNAM_TIMEZONE).toDate();
        }
      }
    }
  });

  // Process match types
  if (result.length > 0 && 'matchType' in result[0]) {
    result = processMatchTypes(result, assetType, source);
  }

  // Sort by time
  result.sort((a, b) => {
    if (!a.time) return -1;
    if (!b.time) return 1;

    const timeA = dayjs(a.time);
    const timeB = dayjs(b.time);
    return timeA.isBefore(timeB) ? -1 : 1;
  });

  // Add metadata
  result.forEach((item) => {
    item._symbol = symbol;
    item._category = assetType;
    item._source = source;
  });

  return result;
}

/**
 * Flatten a hierarchical object into a flat object with concatenated keys
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix: string = '',
  separator: string = '_'
): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, flattenObject(value, newKey, separator));
    } else {
      // Assign the value to the new key
      result[newKey] = value;
    }
  });

  return result;
}

/**
 * Clean HTML tags from object values
 */
export function cleanHtmlFromObject(
  data: Record<string, any>,
  htmlKeys?: string[]
): Record<string, any> {
  const result: Record<string, any> = {};

  // Helper function to clean HTML from a string
  const cleanHtml = (html: string): string => {
    // Simple HTML cleaning without using browser APIs
    // This is a simplified version - for production, consider using a proper HTML parser
    return html
      .replace(/<[^>]+>/g, ' ') // Replace tags with spaces
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim(); // Trim leading/trailing spaces
  };

  // Process each property
  Object.entries(data).forEach(([key, value]) => {
    // If htmlKeys is provided, only clean those keys
    const shouldClean = !htmlKeys || htmlKeys.includes(key);

    if (
      typeof value === 'string' &&
      shouldClean &&
      (value.includes('<') || value.includes('&nbsp;'))
    ) {
      // Clean HTML from string
      result[key] = cleanHtml(value);
    } else if (Array.isArray(value)) {
      // Process arrays recursively
      result[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? cleanHtmlFromObject(item, htmlKeys)
          : typeof item === 'string' && shouldClean
          ? cleanHtml(item)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      // Process nested objects recursively
      result[key] = cleanHtmlFromObject(value, htmlKeys);
    } else {
      // Keep other values as is
      result[key] = value;
    }
  });

  return result;
}
```

## Implementation Details

### Key Function Behaviors

1. **Data Standardization**:

   - Both implementations convert various API response formats into standardized structures
   - The Python implementation uses pandas DataFrame while TypeScript uses array of objects
   - Both handle timezone conversion, data type mapping, and source-specific formatting

2. **Financial Data Processing**:

   - Both handle Vietnamese stock market specifics like ATO/ATC trading sessions
   - Both implementations adjust price scaling based on asset types
   - Both add metadata to identify source and asset category

3. **Nested Data Flattening**:
   - Both versions provide utilities to flatten hierarchical data structures
   - The Python version handles pandas MultiIndex columns, while TypeScript flattens objects

### Data Flow

1. Raw API responses are received from different data sources (VCI, TCBS, etc.)
2. Data is transformed using appropriate functions based on the data type (OHLC, intraday, etc.)
3. Column names are standardized using column mappings
4. Date/time fields are converted to appropriate timezone-aware formats
5. Special values (like ATO/ATC trading sessions) are properly labeled
6. The resulting standardized data is returned for use by higher-level modules

## Dependencies

### Required Packages

For the TypeScript implementation:

- **dayjs**: For date/time manipulation with timezone support
- **logger.ts**: Custom logging implementation from the package

## Usage Examples

### OHLC Data Transformation

```typescript
import { ohlcToDataArray } from './transform';

// Column mapping from source to standard names
const columnMap = {
  time: 'time',
  openPrice: 'open',
  highPrice: 'high',
  lowPrice: 'low',
  closePrice: 'close',
  totalVolume: 'volume',
};

// Data types for each column
const dtypeMap = {
  time: 'datetime64[ns]',
  open: 'float64',
  high: 'float64',
  low: 'float64',
  close: 'float64',
  volume: 'int64',
};

// Raw API response data
const rawData = [
  {
    time: '2023-05-15T09:00:00',
    openPrice: 25000,
    highPrice: 25500,
    lowPrice: 24800,
    closePrice: 25300,
    totalVolume: 1250000,
  },
  // ... more data points
];

// Transform data
const transformedData = ohlcToDataArray(
  rawData,
  columnMap,
  dtypeMap,
  'stock',
  'VNM',
  'VCI',
  { floating: 2 }
);

console.log(transformedData);
```

### Intraday Data Transformation

```typescript
import { intradayToDataArray } from './transform';

// Column mapping from source to standard names
const columnMap = {
  t: 'time',
  p: 'price',
  v: 'volume',
  mt: 'matchType',
};

// Data types for each column
const dtypeMap = {
  price: 'float64',
  volume: 'int64',
  matchType: 'string',
};

// Raw API response data
const rawData = [
  {
    t: 1621040100, // Unix timestamp
    p: 25300,
    v: 1000,
    mt: 'b',
  },
  // ... more data points
];

// Transform data
const transformedData = intradayToDataArray(
  rawData,
  columnMap,
  dtypeMap,
  'VNM',
  'stock',
  'VCI'
);

console.log(transformedData);
```

### HTML Cleaning

```typescript
import { cleanHtmlFromObject } from './transform';

const rawData = {
  description: '<p>This is a <strong>description</strong> with HTML.</p>',
  summary: 'Plain text summary',
  details: {
    content: '<ul><li>Item 1</li><li>Item 2</li></ul>',
  },
};

const cleanedData = cleanHtmlFromObject(rawData);
console.log(cleanedData);
// Output:
// {
//   description: 'This is a description with HTML.',
//   summary: 'Plain text summary',
//   details: {
//     content: 'Item 1 Item 2'
//   }
// }
```

## Implementation Notes

1. **Pandas vs. Array Manipulation**:

   - The Python implementation relies heavily on pandas DataFrame operations
   - The TypeScript version uses arrays and object manipulation instead
   - Both achieve the same goal of standardizing data formats

2. **Date/Time Handling**:

   - Python uses a combination of datetime, pytz, and pandas timestamp functionality
   - TypeScript uses dayjs for more consistent timezone and formatting support

3. **Improved Error Handling**:

   - The TypeScript implementation includes more robust error handling
   - Both versions validate required fields and data integrity

4. **Vietnam Market Specifics**:

   - Both implementations handle Vietnam market specifics like:
     - UTC+7 timezone
     - ATO/ATC trading sessions
     - Price scaling (dividing by 1000 for stock prices)

5. **Resampling**:
   - The Python version includes functionality for resampling time series data
   - This would need additional libraries or custom implementation in TypeScript

Note: The TypeScript implementation requires robust date handling with timezone support and careful handling of different API response formats. For production use, consider adding more validation and error recovery mechanisms.
