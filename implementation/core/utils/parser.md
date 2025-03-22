# Implementation of Parser Module (Core Utilities)

**Original Python Implementation**: [parser.py](/vnstock/core/utils/parser.py)


## Overview

The `parser.py` module in the Python `vnstock` package provides essential data parsing and transformation utilities used throughout the package. These utilities handle various tasks such as timestamp parsing, data flattening, and asset type detection. The module acts as a core component that supports data processing functions across different data source modules.

## Functions and Methods

### 1. `parse_timestamp(time_value)`

Converts a datetime object or string representation of time to a Unix timestamp.

#### Python Implementation

```python
def parse_timestamp(time_value):
    """
    Convert a datetime object or a string representation of time to a Unix timestamp.
    Parameters:
        - time_value: A datetime object or a string representation of time. Supported formats are '%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', and '%Y-%m-%d' or datetime object.
    """
    try:
        if isinstance(time_value, datetime):
            time_value = timezone('Asia/Ho_Chi_Minh').localize(time_value)
        elif isinstance(time_value, str):
            if ' ' in time_value and ':' in time_value.split(' ')[1]:
                try:
                    time_value = datetime.strptime(time_value, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    time_value = datetime.strptime(time_value, '%Y-%m-%d %H:%M')
            else:
                time_value = datetime.strptime(time_value, '%Y-%m-%d')
        else:
            print("Invalid input type. Supported types are datetime or string.")
            return None

        timestamp = int(time_value.timestamp())
        return timestamp
    except ValueError:
        print("Invalid timestamp format")
        return None
```

### 2. `localize_timestamp(timestamp, unit, return_scalar, return_string, string_format)`

Converts timestamp values to Vietnam timezone (UTC+7).

#### Python Implementation

```python
def localize_timestamp (
    timestamp: Union[pd.Series, int, float, list, np.ndarray, pd.Timestamp, Any],
    unit: Literal['s', 'ms', 'us', 'ns'] = 's',
    return_scalar: bool = False,
    return_string: bool = False,
    string_format: str = '%Y-%m-%d %H:%M:%S'
) -> Union[pd.Series, pd.Timestamp, str]:
    """
    Convert timestamp values to Vietnam timezone (UTC+7).

    Parameters:
        timestamp: Timestamp value(s) - can be Series, list, array, or scalar
        unit: Unit for timestamp conversion ('s' for seconds, 'ms' for milliseconds, etc.)
        return_scalar: If True and input can be treated as scalar, return a single value
        return_string: If True, return string representation(s) instead of datetime objects
        string_format: Format for datetime strings if return_string=True

    Returns:
        - Series of datetime objects (default)
        - Series of formatted strings (if return_string=True)
        - Single Timestamp (if return_scalar=True and input is scalar-like)
        - Formatted string (if return_scalar=True, return_string=True and input is scalar-like)
    """
    # Determine if input should be treated as a scalar value
    treat_as_scalar = False

    # Direct scalar types
    if np.isscalar(timestamp) or isinstance(timestamp, (pd.Timestamp, datetime)):
        treat_as_scalar = True
        timestamp_series = pd.Series([timestamp])
    # Series with one element
    elif isinstance(timestamp, pd.Series) and len(timestamp) == 1:
        treat_as_scalar = True
        timestamp_series = timestamp
    # List, array, etc. with one element
    elif hasattr(timestamp, '__len__') and len(timestamp) == 1:
        treat_as_scalar = True
        timestamp_series = pd.Series(timestamp)
    # Other cases - treat as non-scalar
    else:
        timestamp_series = pd.Series(timestamp) if not isinstance(timestamp, pd.Series) else timestamp

    # Convert to datetime with timezone
    dt_series = pd.to_datetime(timestamp_series, unit=unit)
    vietnam_series = dt_series.dt.tz_localize('UTC').dt.tz_convert('Asia/Ho_Chi_Minh')

    # Apply string formatting if requested
    if return_string:
        vietnam_series = vietnam_series.dt.strftime(string_format)

    # Return scalar if requested and input was scalar-like
    if return_scalar and treat_as_scalar:
        return vietnam_series.iloc[0]

    return vietnam_series
```

### 3. `get_asset_type(symbol)`

Determines the asset type (index, stock, derivative, etc.) based on the provided symbol.

#### Python Implementation

```python
def get_asset_type(symbol: str) -> str:
    """
    Xác định loại tài sản dựa trên mã chứng khoán được cung cấp.

    Tham số:
        - symbol (str): Mã chứng khoán hoặc mã chỉ số.

    Trả về:
        - 'index' nếu mã chứng khoán là mã chỉ số.
        - 'stock' nếu mã chứng khoán là mã cổ phiếu.
        - 'derivative' nếu mã chứng khoán là mã hợp đồng tương lai hoặc quyền chọn.
        - 'coveredWarr' nếu mã chứng khoán là mã chứng quyền.
    """
    symbol = symbol.upper()
    if symbol in ['VNINDEX', 'HNXINDEX', 'UPCOMINDEX', 'VN30', 'VN100', 'HNX30', 'VNSML', 'VNMID', 'VNALL', 'VNREAL', 'VNMAT', 'VNIT', 'VNHEAL', 'VNFINSELECT', 'VNFIN', 'VNENE', 'VNDIAMOND', 'VNCONS', 'VNCOND']:
        return 'index'
    elif len(symbol) == 3:
        return 'stock'
    elif len(symbol) in [7, 9]:
        fm_pattern = re.compile(r'VN30F\d{1,2}M')
        ym_pattern = re.compile(r'VN30F\d{4}')
        gb_pattern = re.compile(r'[A-Z]{3}\d{5}')
        bond_pattern = re.compile(r'[A-Z]{3}\d{6}')
        if bond_pattern.match(symbol) or gb_pattern.match(symbol):
            return 'bond'
        elif fm_pattern.match(symbol) or ym_pattern.match(symbol):
            return 'derivative'
        else:
            raise ValueError('Invalid derivative symbol. Symbol must be in format of VN30F1M, VN30F2024, GB10F2024')
    elif len(symbol) == 8:
        return 'coveredWarr'
    else:
        raise ValueError('Invalid symbol. Your symbol format is not recognized!')
```

### 4. `camel_to_snake(name)`

Converts variable names from CamelCase to snake_case.

#### Python Implementation

```python
def camel_to_snake(name):
    """
    Chuyển đổi tên biến từ dạng CamelCase sang snake_case.

    Tham số:
        - name (str): Tên biến dạng CamelCase.

    Trả về:
        - str: Tên biến dạng snake_case.
    """
    str1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    output = re.sub('([a-z0-9])([A-Z])', r'\1_\2', str1).lower()
    # replace . with _
    output = output.replace('.', '_')
    return output
```

### 5. `flatten_data(json_data, parent_key, sep)`

Flattens nested JSON data into a standard dict format.

#### Python Implementation

```python
def flatten_data(json_data, parent_key='', sep='_'):
    """
    Làm phẳng dữ liệu JSON thành dạng dict tiêu chuẩn.

    Tham số:
        - json_data: Dữ liệu JSON trả về từ API.
        - parent_key: Key cha của dữ liệu JSON.
        - sep: Ký tự phân cách giữa các key.
    """
    items = []
    for k, v in json_data.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_data(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)
```

### 6. `last_n_days(n)`

Returns a date value in YYYY-MM-DD format for the last n days.

#### Python Implementation

```python
def last_n_days(n):
    """
    Return a date value in YYYY-MM-DD format for last n days. If n = 0, return today's date.
    """
    date_value = (datetime.today() - timedelta(days=n)).strftime('%Y-%m-%d')
    return date_value
```

### 7. `decd(byte_data)`

Decrypts encrypted byte data using a Fernet cipher.

#### Python Implementation

```python
def decd(byte_data):
    from cryptography.fernet import Fernet
    import base64
    kb = UA['Chrome'].replace(' ', '').ljust(32)[:32].encode('utf-8')
    kb64 = base64.urlsafe_b64encode(kb)
    cipher = Fernet(kb64)
    return cipher.decrypt(byte_data).decode('utf-8')
```

## TypeScript Implementation

### TypeScript Interfaces

```typescript
/**
 * Options for timestamp localization
 */
interface TimestampOptions {
  unit?: 's' | 'ms' | 'us' | 'ns';
  returnScalar?: boolean;
  returnString?: boolean;
  stringFormat?: string;
}

/**
 * Asset types in the Vietnamese market
 */
type AssetType = 'index' | 'stock' | 'derivative' | 'coveredWarr' | 'bond';
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

// Vietnamese timezone
const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

// Logger instance
const logger = getLogger('core.utils.parser');

/**
 * Convert a date string or Date object to a Unix timestamp (seconds)
 */
export function parseTimestamp(timeValue: Date | string): number | null {
  try {
    let date: dayjs.Dayjs;

    if (timeValue instanceof Date) {
      date = dayjs(timeValue).tz(VIETNAM_TIMEZONE);
    } else if (typeof timeValue === 'string') {
      // Try different formats based on the string format
      const hasTime =
        timeValue.includes(' ') && timeValue.split(' ')[1].includes(':');

      if (hasTime) {
        // Try HH:MM:SS format first
        try {
          date = dayjs(timeValue, 'YYYY-MM-DD HH:mm:ss').tz(VIETNAM_TIMEZONE);
        } catch (e) {
          // Fall back to HH:MM format
          date = dayjs(timeValue, 'YYYY-MM-DD HH:mm').tz(VIETNAM_TIMEZONE);
        }
      } else {
        // Date only format
        date = dayjs(timeValue, 'YYYY-MM-DD').tz(VIETNAM_TIMEZONE);
      }
    } else {
      logger.error('Invalid input type. Supported types are Date or string.');
      return null;
    }

    // Check if the date is valid
    if (!date.isValid()) {
      logger.error('Invalid date format');
      return null;
    }

    // Convert to Unix timestamp (seconds)
    return Math.floor(date.valueOf() / 1000);
  } catch (error) {
    logger.error(`Error parsing timestamp: ${error.message}`);
    return null;
  }
}

/**
 * Convert timestamp values to Vietnam timezone (UTC+7)
 */
export function localizeTimestamp(
  timestamp: number | number[] | Date | Date[],
  options: TimestampOptions = {}
): Date | Date[] | string | string[] {
  const {
    unit = 's',
    returnScalar = false,
    returnString = false,
    stringFormat = 'YYYY-MM-DD HH:mm:ss',
  } = options;

  // Determine if input should be treated as scalar
  const treatAsScalar = !Array.isArray(timestamp);

  // Convert to array for uniform processing
  const timestamps = Array.isArray(timestamp) ? timestamp : [timestamp];

  // Determine multiplier based on unit
  let multiplier = 1000; // Default for seconds
  if (unit === 'ms') multiplier = 1;
  else if (unit === 'us') multiplier = 0.001;
  else if (unit === 'ns') multiplier = 0.000001;

  // Process each timestamp
  const processed = timestamps.map((ts) => {
    // If already a Date object, use it directly
    const date = ts instanceof Date ? dayjs(ts) : dayjs(ts * multiplier);

    // Convert to Vietnam timezone
    const vietnamDate = date.tz(VIETNAM_TIMEZONE);

    // Return string or Date based on option
    return returnString
      ? vietnamDate.format(stringFormat)
      : vietnamDate.toDate();
  });

  // Return scalar or array based on input and option
  if (returnScalar && treatAsScalar) {
    return processed[0];
  }

  return processed;
}

/**
 * Determine the asset type based on the symbol format
 */
export function getAssetType(symbol: string): AssetType {
  const uppercaseSymbol = symbol.toUpperCase();

  // List of index symbols
  const INDEX_SYMBOLS = [
    'VNINDEX',
    'HNXINDEX',
    'UPCOMINDEX',
    'VN30',
    'VN100',
    'HNX30',
    'VNSML',
    'VNMID',
    'VNALL',
    'VNREAL',
    'VNMAT',
    'VNIT',
    'VNHEAL',
    'VNFINSELECT',
    'VNFIN',
    'VNENE',
    'VNDIAMOND',
    'VNCONS',
    'VNCOND',
  ];

  // Check if the symbol is an index
  if (INDEX_SYMBOLS.includes(uppercaseSymbol)) {
    return 'index';
  }

  // Check if the symbol is a stock (3 characters)
  if (uppercaseSymbol.length === 3) {
    return 'stock';
  }

  // Check for derivatives and bonds (7 or 9 characters)
  if (uppercaseSymbol.length === 7 || uppercaseSymbol.length === 9) {
    const fmPattern = /VN30F\d{1,2}M/;
    const ymPattern = /VN30F\d{4}/;
    const gbPattern = /[A-Z]{3}\d{5}/;
    const bondPattern = /[A-Z]{3}\d{6}/;

    if (bondPattern.test(uppercaseSymbol) || gbPattern.test(uppercaseSymbol)) {
      return 'bond';
    }

    if (fmPattern.test(uppercaseSymbol) || ymPattern.test(uppercaseSymbol)) {
      return 'derivative';
    }

    throw new Error(
      'Invalid derivative symbol. Symbol must be in format of VN30F1M, VN30F2024, GB10F2024'
    );
  }

  // Check for covered warrants (8 characters)
  if (uppercaseSymbol.length === 8) {
    return 'coveredWarr';
  }

  throw new Error('Invalid symbol. Your symbol format is not recognized!');
}

/**
 * Convert camelCase strings to snake_case
 */
export function camelToSnake(name: string): string {
  let result = name.replace(/([A-Z])/g, '_$1').toLowerCase();
  // Replace consecutive underscores with a single one
  result = result.replace(/_+/g, '_');
  // Replace dots with underscores
  result = result.replace(/\./g, '_');
  // Remove leading underscore if present
  if (result.startsWith('_')) {
    result = result.substring(1);
  }
  return result;
}

/**
 * Flatten nested JSON data into a flat object with concatenated keys
 */
export function flattenData(
  jsonData: Record<string, any>,
  parentKey: string = '',
  separator: string = '_'
): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(jsonData).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}${separator}${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, flattenData(value, newKey, separator));
    } else {
      // Assign the value to the new key
      result[newKey] = value;
    }
  });

  return result;
}

/**
 * Return a date string in YYYY-MM-DD format for n days ago
 */
export function lastNDays(n: number): string {
  return dayjs().subtract(n, 'day').format('YYYY-MM-DD');
}

/**
 * Decrypt encrypted byte data
 * Note: This implementation uses a different approach than the Python version
 * as browser environments handle encryption differently
 */
export function decd(byteData: Uint8Array, userAgent: string): string {
  try {
    // In a real implementation, you'd need to use the Web Crypto API
    // This is a simplified example that mimics the Python version's approach
    // but would need to be adapted for actual browser environments

    // Note: This is a placeholder implementation
    // For security reasons, encryption/decryption should be handled carefully

    // In a real implementation:
    // const key = userAgent.replace(' ', '').padEnd(32).substring(0, 32);
    // const decoder = new TextDecoder();
    // return decoder.decode(decryptWithKey(byteData, key));

    throw new Error(
      'Encryption/decryption not implemented in browser environment'
    );
  } catch (error) {
    logger.error(`Decryption error: ${error.message}`);
    throw error;
  }
}
```

## Implementation Details

### Key Function Behaviors

1. **Timestamp Handling**:

   - The Python implementation uses `pytz` to handle timezone conversion
   - The TypeScript implementation uses `dayjs` with timezone plugins
   - Both implementations handle Vietnam's UTC+7 timezone

2. **Asset Type Detection**:

   - Uses symbol length and pattern matching to determine asset type
   - Validates symbols against known patterns for different asset classes
   - Returns standardized asset type strings

3. **Data Flattening**:
   - Recursively flattens nested JSON objects
   - Maintains parent-child relationships in flattened keys
   - Configurable separator character for key joining

### Data Flow

1. API responses with nested JSON structures are received
2. The `flatten_data` function transforms nested structures into flat key-value pairs
3. Timestamp values are localized to Vietnam timezone using `localize_timestamp`
4. Data is transformed with `camel_to_snake` for consistent naming conventions
5. Asset types are determined using `get_asset_type` for conditional processing

## Dependencies

### Required Packages

For the TypeScript implementation:

- **dayjs**: For date/time manipulation with timezone support
- **dayjs/plugin/utc**: UTC date handling
- **dayjs/plugin/timezone**: Timezone conversion
- **logger.ts**: Custom logging implementation

## Usage Examples

### Timestamp Parsing

```typescript
import { parseTimestamp } from './parser';

// Parse a date string
const timestamp1 = parseTimestamp('2023-05-15');
console.log(timestamp1); // Unix timestamp in seconds

// Parse a date time string
const timestamp2 = parseTimestamp('2023-05-15 14:30:00');
console.log(timestamp2); // Unix timestamp in seconds

// Parse a Date object
const timestamp3 = parseTimestamp(new Date(2023, 4, 15));
console.log(timestamp3); // Unix timestamp in seconds
```

### Asset Type Detection

```typescript
import { getAssetType } from './parser';

// Check stock symbol
console.log(getAssetType('VNM')); // 'stock'

// Check index symbol
console.log(getAssetType('VNINDEX')); // 'index'

// Check derivative symbol
console.log(getAssetType('VN30F2M')); // 'derivative'
```

### Data Flattening

```typescript
import { flattenData } from './parser';

// Flatten nested object
const nestedData = {
  user: {
    name: 'John',
    address: {
      city: 'Hanoi',
      country: 'Vietnam',
    },
  },
  status: 'active',
};

const flatData = flattenData(nestedData);
console.log(flatData);
// Output:
// {
//   'user_name': 'John',
//   'user_address_city': 'Hanoi',
//   'user_address_country': 'Vietnam',
//   'status': 'active'
// }
```

## Implementation Notes

1. **Browser Compatibility**:

   - The TypeScript implementation uses dayjs instead of Python's datetime/pytz for better browser compatibility
   - The encryption/decryption functionality may need adaptation for browser environments

2. **Error Handling**:

   - The TypeScript implementation includes more robust error handling and logging
   - Errors are properly caught and logged with informative messages

3. **Type Safety**:

   - TypeScript interfaces and types provide compile-time type checking
   - Function parameters and return types are explicitly defined

4. **Differences from Python**:
   - Python's pandas DataFrame operations are replaced with array manipulations
   - The TypeScript implementation handles scalar vs. array inputs differently
   - Date handling relies on dayjs instead of Python's datetime and pytz

By implementing these utility functions in TypeScript, the package will have consistent data parsing and transformation capabilities across all modules, ensuring coherent data handling throughout the application.
