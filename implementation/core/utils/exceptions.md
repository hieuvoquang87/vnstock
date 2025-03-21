# Implementation of Exception Handling

## Overview

The `vnstock` package does not have a dedicated exceptions module but rather implements a distributed approach to error handling. Throughout the codebase, standard Python exceptions are raised with custom error messages, while error handling is primarily managed through logging, retries for network operations, and graceful degradation when possible.

## Error Types and Categories

### 1. Input Validation Errors

Input validation errors occur when parameters provided to functions do not meet the required format or constraints.

#### Python Implementation

```python
# From vnstock/explorer/vci/quote.py
def history(self, start: str, end: Optional[str]=None, interval: Optional[str]="1D", ...):
    # Input validation
    start_time = datetime.strptime(ticker.start, "%Y-%m-%d")
    if end is not None:
        end_time = datetime.strptime(ticker.end, "%Y-%m-%d") + pd.Timedelta(days=1)
        if start_time > end_time:
            raise ValueError("Thời gian bắt đầu không thể lớn hơn thời gian kết thúc.")
```

### 2. API Connection Errors

Connection errors occur when the API request fails due to network issues, server errors, or authentication failures.

#### Python Implementation

```python
# From vnstock/core/utils/client.py
def send_request(url: str, headers: Dict[str, str], method: str = "GET",
                 params: Optional[Dict] = None, payload: Optional[Dict] = None,
                 show_log: bool = False, timeout: int = 30) -> Dict[str, Any]:
    try:
        # API request code...
        if response.status_code != 200:
            raise ConnectionError(f"Failed to fetch data: {response.status_code} - {response.reason}")
        # Process response...
    except requests.exceptions.RequestException as e:
        error_msg = f"API request failed: {str(e)}"
        logger.error(error_msg)
        raise ConnectionError(error_msg)
```

### 3. Data Processing Errors

Data processing errors occur when the API returns data in an unexpected format or when transformations fail.

#### Python Implementation

```python
# Example from data transformation
try:
    df = pd.DataFrame(data)
    # Process data...
except Exception as e:
    logger.error(f"Error processing data: {str(e)}")
    raise ValueError(f"Failed to process data: {str(e)}")
```

### 4. Source Validation Errors

Source validation errors occur when an unsupported data source is requested.

#### Python Implementation

```python
# From vnstock/common/data/data_explorer.py
def _validate_source(self) -> None:
    if self.source not in self.SUPPORTED_SOURCES:
        raise ValueError(f"Chỉ có nguồn dữ liệu từ {', '.join(self.SUPPORTED_SOURCES)} được hỗ trợ.")
```

### 5. Symbol Validation Errors

Symbol validation errors occur when providing an invalid or unrecognized symbol format.

#### Python Implementation

```python
# From vnstock/core/utils/parser.py
def get_asset_type(symbol: str) -> str:
    # Validation logic...
    if symbol in ['VNINDEX', 'HNXINDEX', ...]:
        return 'index'
    elif len(symbol) == 3:
        return 'stock'
    # More validation...
    else:
        raise ValueError('Invalid symbol. Your symbol format is not recognized!')
```

## Retry Mechanism

The `vnstock` package uses the `tenacity` library to implement automatic retries for network operations, improving resilience against transient failures.

#### Python Implementation

```python
# From vnstock/common/data/data_explorer.py
@retry(stop=stop_after_attempt(Config.DEFAULT_RETRIES), wait=wait_exponential(multiplier=1, min=2, max=10))
def history(self, symbol: Optional[str] = None, **kwargs):
    # Method implementation...
    self._update_data_source(symbol)
    return self.data_source.history(**kwargs)
```

## Error Logging

Comprehensive logging is implemented throughout the codebase to aid in debugging and error diagnosis.

#### Python Implementation

```python
# Logger initialization
from vnstock.core.utils.logger import get_logger
logger = get_logger(__name__)

# Example usage in error handling
try:
    # Operation that might fail
    result = some_function()
except Exception as e:
    logger.error(f"Operation failed: {str(e)}")
    raise
```

## TypeScript Implementation

### TypeScript Error Classes

For the TypeScript implementation, we recommend creating custom error classes to provide more structured error handling:

```typescript
/**
 * Base error class for all vnstock errors
 */
export class VnstockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VnstockError';
    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends VnstockError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error for API connection failures
 */
export class ConnectionError extends VnstockError {
  public statusCode?: number;
  public url?: string;

  constructor(message: string, statusCode?: number, url?: string) {
    super(message);
    this.name = 'ConnectionError';
    this.statusCode = statusCode;
    this.url = url;
  }
}

/**
 * Error for data processing failures
 */
export class DataProcessingError extends VnstockError {
  public source?: string;
  public dataType?: string;

  constructor(message: string, source?: string, dataType?: string) {
    super(message);
    this.name = 'DataProcessingError';
    this.source = source;
    this.dataType = dataType;
  }
}

/**
 * Error for unsupported data sources
 */
export class UnsupportedSourceError extends ValidationError {
  public requestedSource: string;
  public supportedSources: string[];

  constructor(requestedSource: string, supportedSources: string[]) {
    super(
      `Only data sources from ${supportedSources.join(', ')} are supported.`
    );
    this.name = 'UnsupportedSourceError';
    this.requestedSource = requestedSource;
    this.supportedSources = supportedSources;
  }
}

/**
 * Error for invalid symbol formats
 */
export class InvalidSymbolError extends ValidationError {
  public symbol: string;

  constructor(symbol: string, message?: string) {
    super(message || `Invalid symbol: ${symbol}`);
    this.name = 'InvalidSymbolError';
    this.symbol = symbol;
  }
}
```

### TypeScript Retry Implementation

For the TypeScript implementation, the `async-retry` package provides similar functionality to Python's `tenacity`:

```typescript
import retry from 'async-retry';
import { ConnectionError } from './errors';
import { Logger } from '../logger';

/**
 * Send HTTP request with retry capability
 */
export async function sendRequest(
  url: string,
  options: RequestInit,
  retries: number = 3,
  logger?: Logger
): Promise<any> {
  return retry(
    async (bail) => {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const error = new ConnectionError(
            `Failed to fetch data: ${response.status} - ${response.statusText}`,
            response.status,
            url
          );

          // Bail immediately (don't retry) for 4xx errors
          if (response.status >= 400 && response.status < 500) {
            bail(error);
            return; // Unreachable but TypeScript needs it
          }

          throw error;
        }

        return await response.json();
      } catch (error) {
        if (logger) {
          logger.error(`API request failed: ${error.message}`);
        }
        throw error;
      }
    },
    {
      retries: retries,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
      onRetry: (error, attempt) => {
        if (logger) {
          logger.warn(`Retry attempt ${attempt} for ${url}: ${error.message}`);
        }
      },
    }
  );
}
```

### TypeScript Error Handling Example

Example of using the custom error classes in a TypeScript component:

```typescript
import {
  ValidationError,
  ConnectionError,
  InvalidSymbolError,
} from '../errors';
import { Logger, getLogger } from '../logger';
import { Config } from '../config';
import { sendRequest } from '../client';

/**
 * Quote component for historical data
 */
export class Quote {
  private symbol: string;
  private source: string;
  private logger: Logger;

  constructor(symbol: string, source: string = Config.DEFAULT_SOURCE) {
    this.symbol = symbol.toUpperCase();
    this.source = source.toUpperCase();
    this.logger = getLogger('Quote');
    this.validateInputs();
  }

  /**
   * Validate component inputs
   */
  private validateInputs(): void {
    // Validate source
    const supportedSources = ['VCI', 'TCBS', 'MSN'];
    if (!supportedSources.includes(this.source)) {
      throw new UnsupportedSourceError(this.source, supportedSources);
    }

    // Validate symbol (simple validation for example)
    if (!this.symbol || this.symbol.length < 2) {
      throw new InvalidSymbolError(
        this.symbol,
        'Symbol must be at least 2 characters'
      );
    }
  }

  /**
   * Get historical price data
   */
  public async history(
    start: string,
    end?: string,
    interval: string = '1D'
  ): Promise<any> {
    try {
      // Validate date inputs
      const startDate = new Date(start);
      const endDate = end ? new Date(end) : new Date();

      if (isNaN(startDate.getTime())) {
        throw new ValidationError(`Invalid start date: ${start}`);
      }

      if (end && isNaN(endDate.getTime())) {
        throw new ValidationError(`Invalid end date: ${end}`);
      }

      if (startDate > endDate) {
        throw new ValidationError('Start date cannot be greater than end date');
      }

      // Prepare request
      const url = `https://api-example/${this.source.toLowerCase()}/history`;
      const params = new URLSearchParams({
        symbol: this.symbol,
        start,
        interval,
      });

      if (end) {
        params.append('end', end);
      }

      // Send request with retry
      const data = await sendRequest(
        `${url}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        Config.DEFAULT_RETRIES,
        this.logger
      );

      // Process data
      return this.processHistoryData(data);
    } catch (error) {
      this.logger.error(`History data fetch failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process history data
   */
  private processHistoryData(data: any): any {
    try {
      // Processing logic here
      return data;
    } catch (error) {
      throw new DataProcessingError(
        `Failed to process history data: ${error.message}`,
        this.source,
        'history'
      );
    }
  }
}
```

## Implementation Details

### Error Localization

While the Python implementation uses a mix of Vietnamese and English error messages, the TypeScript implementation should standardize on English messages for wider accessibility, with internationalization support for other languages if needed.

### Error Context

The TypeScript implementation enhances error objects with additional context (like the related symbol, source, or URL) to aid in troubleshooting.

### Structured Error Handling

The TypeScript implementation provides structured error classes that inherit from a common base class, making it easier to handle specific error categories with appropriate responses.

### Error Recovery

Both implementations use retry mechanisms for network operations, but the TypeScript implementation adds the ability to control which errors should trigger retries versus immediate failure.

## Error Handling Best Practices

When implementing error handling in TypeScript:

1. **Use Specific Error Types**: Throw the most specific error type relevant to the issue.

2. **Include Context**: Provide enough context in error messages to understand what went wrong.

3. **Log Errors**: Log errors with appropriate severity levels before rethrowing or handling them.

4. **Retry Transient Failures**: Use retry mechanisms for operations that might fail due to transient issues.

5. **Graceful Degradation**: When possible, provide fallback behavior rather than failing completely.

6. **Error Translation**: Translate low-level errors to application-specific errors that make sense in the context of the operation.

7. **Consistent Format**: Use a consistent format for error messages to make them easily parseable.

## Dependencies

For the TypeScript implementation, the following dependencies are recommended:

- `async-retry` - For implementing retry mechanisms
- Custom logger implementation for error logging
- Error handling utility functions for common error scenarios
