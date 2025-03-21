# Implementation of Validation Module (Core Utilities)

## Overview

The `validation.py` module in the Python `vnstock` package provides essential input validation utilities used throughout the package. These utilities help ensure data integrity by validating and normalizing user inputs before they're processed by other components. The module includes functions for validating symbols, date ranges, time intervals, pagination parameters, and general model inputs.

## Functions and Methods

### 1. `validate_symbol(symbol, symbol_map)`

Validates and normalizes ticker symbols with optional mapping for special cases like indices.

#### Python Implementation

```python
def validate_symbol(symbol: str, symbol_map: Optional[Dict[str, str]] = None) -> str:
    """
    Validate and normalize ticker symbol with optional mapping for special cases.

    Parameters:
        - symbol: Stock/index symbol
        - symbol_map: Optional mapping dictionary (e.g., for INDEX values)

    Returns:
        - Validated and normalized symbol

    Raises:
        - ValueError: If symbol is invalid or not found in the mapping
    """
    symbol = symbol.upper()

    # Apply mapping if provided (e.g., INDEX mapping)
    if symbol_map and symbol in symbol_map:
        return symbol_map[symbol]

    else:
        # Additional validation already handled by get_asset_type, so we can reuse it
        get_asset_type(symbol)  # This will raise ValueError if symbol is invalid

        return symbol
```

### 2. `validate_date_range(start, end)`

Validates date range inputs and returns normalized datetime objects.

#### Python Implementation

```python
def validate_date_range(start: str, end: Optional[str] = None) -> Tuple[datetime, datetime]:
    """
    Validate date range and return normalized datetime objects.

    Parameters:
        - start: Start date in YYYY-MM-DD format
        - end: End date in YYYY-MM-DD format, defaults to current date

    Returns:
        - Tuple of (start_datetime, end_datetime)

    Raises:
        - ValueError: If dates are invalid or start is after end
    """
    try:
        start_time = datetime.strptime(start, "%Y-%m-%d")

        if end is None:
            end_time = datetime.now() + timedelta(days=1)
        else:
            end_time = datetime.strptime(end, "%Y-%m-%d") + timedelta(days=1)

        if start_time > end_time:
            raise ValueError("Thời gian bắt đầu không thể lớn hơn thời gian kết thúc.")

        return start_time, end_time

    except ValueError as e:
        if "does not match format" in str(e):
            raise ValueError(f"Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.")
        raise
```

### 3. `convert_to_timestamps(dates)`

Converts datetime objects to Unix timestamps for use in API requests.

#### Python Implementation

```python
def convert_to_timestamps(dates: Tuple[datetime, datetime]) -> Tuple[int, int]:
    """
    Convert datetime objects to Unix timestamps.

    Parameters:
        - dates: Tuple of (start_datetime, end_datetime)

    Returns:
        - Tuple of (start_timestamp, end_timestamp)
    """
    # Reuse existing parse_timestamp function where appropriate
    start_stamp = int(dates[0].timestamp())
    end_stamp = int(dates[1].timestamp())

    return start_stamp, end_stamp
```

### 4. `validate_interval(interval, interval_map)`

Validates time interval parameters and maps them to data source-specific values.

#### Python Implementation

```python
def validate_interval(interval: str, interval_map: Dict[str, str]) -> str:
    """
    Validate and map interval parameter to data source specific value.

    Parameters:
        - interval: Time interval (e.g., 1D, 1H)
        - interval_map: Dictionary mapping intervals to API-specific values

    Returns:
        - Validated interval value

    Raises:
        - ValueError: If interval is invalid
    """
    if interval not in interval_map:
        valid_options = ', '.join(interval_map.keys())
        raise ValueError(f"Giá trị interval không hợp lệ: {interval}. Vui lòng chọn: {valid_options}")

    return interval_map[interval]
```

### 5. `validate_pagination(page_size, page, max_page_size)`

Validates pagination parameters for paginated API requests.

#### Python Implementation

```python
def validate_pagination(page_size: int, page: int = 0, max_page_size: int = 100) -> Tuple[int, int]:
    """
    Validate pagination parameters for API requests.

    Parameters:
        - page_size: Number of items per page
        - page: Page number (0-based)
        - max_page_size: Maximum allowed page size

    Returns:
        - Tuple of (normalized_page_size, total_pages)

    Raises:
        - ValueError: If pagination parameters are invalid
    """
    if page_size <= 0:
        raise ValueError("Page size must be greater than 0.")

    if page < 0:
        raise ValueError("Page number must be non-negative.")

    # Calculate how many pages needed for the requested page_size
    total_pages = (page_size // max_page_size) + (1 if page_size % max_page_size != 0 else 0)

    return min(page_size, max_page_size), total_pages
```

### 6. `validate_model_input(model_data, required_fields)`

Validates data model inputs against a list of required fields.

#### Python Implementation

```python
def validate_model_input(model_data: Dict[str, Any], required_fields: list) -> None:
    """
    Validate data model inputs against required fields.

    Parameters:
        - model_data: Dictionary of input data
        - required_fields: List of required field names

    Raises:
        - ValueError: If required fields are missing
    """
    missing_fields = [field for field in required_fields if field not in model_data]

    if missing_fields:
        raise ValueError(f"Thiếu các trường bắt buộc: {', '.join(missing_fields)}")
```

## TypeScript Implementation

### TypeScript Interfaces

```typescript
/**
 * Symbol mapping interface
 */
interface SymbolMap {
  [key: string]: string;
}

/**
 * Interval mapping interface
 */
interface IntervalMap {
  [key: string]: string;
}

/**
 * Model data interface
 */
interface ModelData {
  [key: string]: any;
}

/**
 * Date range result
 */
interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Timestamp range result
 */
interface TimestampRange {
  startTimestamp: number;
  endTimestamp: number;
}

/**
 * Pagination result
 */
interface PaginationResult {
  pageSize: number;
  totalPages: number;
}
```

### TypeScript Implementation

```typescript
import dayjs from 'dayjs';
import { getAssetType } from './parser';
import { getLogger } from './logger';

// Logger instance
const logger = getLogger('core.utils.validation');

/**
 * Validate and normalize ticker symbol with optional mapping for special cases
 *
 * @param symbol - Stock/index symbol
 * @param symbolMap - Optional mapping dictionary (e.g., for INDEX values)
 * @returns Validated and normalized symbol
 * @throws Error if symbol is invalid or not found in the mapping
 */
export function validateSymbol(symbol: string, symbolMap?: SymbolMap): string {
  const upperSymbol = symbol.toUpperCase();

  // Apply mapping if provided (e.g., INDEX mapping)
  if (symbolMap && upperSymbol in symbolMap) {
    return symbolMap[upperSymbol];
  }

  // Additional validation already handled by getAssetType, so we can reuse it
  getAssetType(upperSymbol); // This will throw Error if symbol is invalid

  return upperSymbol;
}

/**
 * Validate date range inputs and return normalized Date objects
 *
 * @param start - Start date in YYYY-MM-DD format
 * @param end - End date in YYYY-MM-DD format, defaults to current date
 * @returns Object with startDate and endDate properties
 * @throws Error if dates are invalid or start is after end
 */
export function validateDateRange(start: string, end?: string): DateRange {
  try {
    // Parse start date
    const startDate = dayjs(start, 'YYYY-MM-DD');

    if (!startDate.isValid()) {
      throw new Error(
        'Invalid start date format. Please use YYYY-MM-DD format.'
      );
    }

    // Handle end date
    let endDate;
    if (!end) {
      // Default to tomorrow to include today's data
      endDate = dayjs().add(1, 'day');
    } else {
      endDate = dayjs(end, 'YYYY-MM-DD');

      if (!endDate.isValid()) {
        throw new Error(
          'Invalid end date format. Please use YYYY-MM-DD format.'
        );
      }

      // Add a day to include the end date in the range
      endDate = endDate.add(1, 'day');
    }

    // Validate date order
    if (startDate.isAfter(endDate)) {
      throw new Error('Start date cannot be after end date.');
    }

    return {
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
    };
  } catch (error) {
    // Rethrow with more specific message if it's a format error
    if (error instanceof Error && error.message.includes('format')) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
    }
    throw error;
  }
}

/**
 * Convert Date objects to Unix timestamps
 *
 * @param dateRange - Object with startDate and endDate properties
 * @returns Object with startTimestamp and endTimestamp properties
 */
export function convertToTimestamps(dateRange: DateRange): TimestampRange {
  return {
    startTimestamp: Math.floor(dateRange.startDate.getTime() / 1000),
    endTimestamp: Math.floor(dateRange.endDate.getTime() / 1000),
  };
}

/**
 * Validate and map interval parameter to data source specific value
 *
 * @param interval - Time interval (e.g., 1D, 1H)
 * @param intervalMap - Dictionary mapping intervals to API-specific values
 * @returns Validated interval value
 * @throws Error if interval is invalid
 */
export function validateInterval(
  interval: string,
  intervalMap: IntervalMap
): string {
  if (!(interval in intervalMap)) {
    const validOptions = Object.keys(intervalMap).join(', ');
    throw new Error(
      `Invalid interval value: ${interval}. Please choose: ${validOptions}`
    );
  }

  return intervalMap[interval];
}

/**
 * Validate pagination parameters for API requests
 *
 * @param pageSize - Number of items per page
 * @param page - Page number (0-based)
 * @param maxPageSize - Maximum allowed page size
 * @returns Object with normalized pageSize and totalPages
 * @throws Error if pagination parameters are invalid
 */
export function validatePagination(
  pageSize: number,
  page: number = 0,
  maxPageSize: number = 100
): PaginationResult {
  if (pageSize <= 0) {
    throw new Error('Page size must be greater than 0.');
  }

  if (page < 0) {
    throw new Error('Page number must be non-negative.');
  }

  // Calculate how many pages needed for the requested pageSize
  const totalPages =
    Math.floor(pageSize / maxPageSize) + (pageSize % maxPageSize !== 0 ? 1 : 0);

  return {
    pageSize: Math.min(pageSize, maxPageSize),
    totalPages,
  };
}

/**
 * Validate data model inputs against a list of required fields
 *
 * @param modelData - Dictionary of input data
 * @param requiredFields - List of required field names
 * @throws Error if required fields are missing
 */
export function validateModelInput(
  modelData: ModelData,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter((field) => !(field in modelData));

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}
```

## Implementation Details

### Key Function Behaviors

1. **Input Validation**:

   - All functions perform strict validation on input parameters
   - Consistent error handling with descriptive error messages
   - Type-safe implementations in both Python and TypeScript

2. **Default Value Handling**:

   - Functions provide sensible defaults where appropriate (e.g., end date defaulting to current date)
   - Required vs. optional parameters are clearly differentiated

3. **Normalization**:
   - Symbol normalization (uppercase conversion)
   - Date parsing and normalization to consistent formats
   - Interval mapping to API-specific values

### Data Flow

1. Raw user input is received from higher-level modules
2. Validation functions verify the input format, range, and presence of required fields
3. Inputs are normalized to consistent formats (uppercase symbols, parsed dates, etc.)
4. Validation errors are caught and descriptive error messages are returned
5. Normalized inputs are passed back to the calling modules for further processing

## Dependencies

### Required Packages

For the Python implementation:

- `datetime` - For date/time handling
- `typing` - For type annotations
- `vnstock.core.utils.parser` - For reusing asset type validation
- `vnstock.core.utils.logger` - For logging

For the TypeScript implementation:

- `dayjs` - For date/time handling and manipulation
- `parser.ts` - For asset type validation
- `logger.ts` - For logging

## Usage Examples

### Symbol Validation

```typescript
import { validateSymbol } from './validation';

// Example index mapping
const indexMap = {
  VN30: 'VN30INDEX',
  VNINDEX: 'VNINDEX',
  HNX: 'HNXINDEX',
};

try {
  // Validates and normalizes a stock symbol
  const stockSymbol = validateSymbol('VNM');
  console.log(stockSymbol); // 'VNM'

  // Validates and maps an index symbol
  const indexSymbol = validateSymbol('VN30', indexMap);
  console.log(indexSymbol); // 'VN30INDEX'

  // Will throw an error for invalid symbols
  const invalidSymbol = validateSymbol('INVALID123');
} catch (error) {
  console.error('Validation error:', error.message);
}
```

### Date Range Validation

```typescript
import { validateDateRange, convertToTimestamps } from './validation';

try {
  // Validate date range with explicit end date
  const dateRange = validateDateRange('2023-01-01', '2023-12-31');
  console.log(dateRange);
  // { startDate: 2023-01-01T00:00:00.000Z, endDate: 2024-01-01T00:00:00.000Z }

  // Convert to timestamps for API requests
  const timestamps = convertToTimestamps(dateRange);
  console.log(timestamps);
  // { startTimestamp: 1672531200, endTimestamp: 1704067200 }

  // Validate date range with default end date (current date)
  const currentDateRange = validateDateRange('2023-01-01');
  console.log(currentDateRange);
  // { startDate: 2023-01-01T00:00:00.000Z, endDate: [tomorrow's date] }
} catch (error) {
  console.error('Validation error:', error.message);
}
```

### Interval Validation

```typescript
import { validateInterval } from './validation';

// Example interval mapping for different data sources
const vciIntervalMap = {
  '1D': 'D',
  '1W': 'W',
  '1M': 'M',
};

const tcbsIntervalMap = {
  '1m': '1',
  '1H': '60',
  '1D': 'D',
  '1W': 'W',
  '1M': 'M',
};

try {
  // Validate interval for VCI source
  const vciInterval = validateInterval('1D', vciIntervalMap);
  console.log(vciInterval); // 'D'

  // Validate interval for TCBS source
  const tcbsInterval = validateInterval('1H', tcbsIntervalMap);
  console.log(tcbsInterval); // '60'

  // Will throw an error for invalid intervals
  const invalidInterval = validateInterval('2H', tcbsIntervalMap);
} catch (error) {
  console.error('Validation error:', error.message);
}
```

### Pagination Validation

```typescript
import { validatePagination } from './validation';

try {
  // Basic pagination validation
  const pagination = validatePagination(20, 1);
  console.log(pagination); // { pageSize: 20, totalPages: 1 }

  // Pagination with large page size
  const largePagination = validatePagination(250, 0);
  console.log(largePagination); // { pageSize: 100, totalPages: 3 }

  // Will throw an error for invalid pagination
  const invalidPagination = validatePagination(-10);
} catch (error) {
  console.error('Validation error:', error.message);
}
```

### Model Input Validation

```typescript
import { validateModelInput } from './validation';

const symbolModel = {
  symbol: 'VNM',
  start: '2023-01-01',
};

try {
  // Validate required fields are present
  validateModelInput(symbolModel, ['symbol', 'start']);
  console.log('Model is valid');

  // Will throw an error for missing required fields
  validateModelInput(symbolModel, ['symbol', 'start', 'end']);
} catch (error) {
  console.error('Validation error:', error.message);
}
```

## Implementation Notes

1. **Error Handling Localization**:

   - The Python implementation returns error messages in Vietnamese
   - The TypeScript implementation uses English for consistency across platforms
   - Consider using a localization system for multi-language support

2. **Validation Chain**:

   - Functions often work together in a chain (e.g., validate_date_range → convert_to_timestamps)
   - TypeScript implementation uses more structured return types compared to tuples in Python

3. **Dependency on Parser**:

   - Both implementations depend on the parser module for certain validations
   - This creates a circular dependency that should be handled carefully

4. **Type Safety**:

   - TypeScript implementation provides stronger type safety through interfaces
   - Python implementation uses type annotations but runtime checking is minimal

5. **Performance Considerations**:
   - All validation functions are designed to be lightweight
   - For high-frequency operations, consider caching validation results
