# Core Utilities Implementation

**Original Python Implementation**: [__init__.py](/vnstock/core/utils/__init__.py)


## Overview

The Core Utilities module provides essential functionality used throughout the vnstock library. It contains a collection of helper functions, classes, and utilities that handle common tasks such as HTTP requests, data transformation, logging, validation, and error handling. These utilities form the foundation that enables higher-level modules to operate efficiently and consistently.

## Purpose

The Core Utilities module serves several key purposes:

1. **Code Reusability**: Provides common functionality to avoid duplication across modules
2. **Standardization**: Ensures consistent approaches to common tasks
3. **Error Handling**: Implements robust error handling patterns
4. **Performance Optimization**: Offers optimized implementations of frequently used operations
5. **Cross-cutting Concerns**: Handles aspects that affect multiple parts of the application

## Structure

The Core Utilities module is organized into several functional areas:

```
core/utils/
├── client.md        - HTTP client utilities
├── env.md           - Environment utilities
├── exceptions.md    - Custom exceptions and error handling
├── ext.md           - Extension utilities
├── help.md          - Help and documentation utilities
├── launcher.md      - Application launcher utilities
├── logger.md        - Logging utilities
├── market.md        - Market hours and trading session utilities
├── parser.md        - Data parsing utilities
├── transform.md     - Data transformation utilities
├── upgrade.md       - Package upgrade utilities
├── user_agent.md    - User agent management
└── validation.md    - Input validation utilities
```

## Key Components

### HTTP Client

The HTTP client provides a unified interface for making API requests:

```typescript
/**
 * Send an HTTP request with error handling and retries
 * @param url The URL to send the request to
 * @param options Request options
 * @returns Promise resolving to the response data
 */
export async function sendRequest<T>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  // Implementation details
}
```

### Logging

The logging utilities provide standardized logging throughout the application:

```typescript
/**
 * Get a logger instance for a specific module
 * @param module The module name
 * @returns Logger instance
 */
export function getLogger(module: string): Logger {
  // Implementation details
}
```

### Data Transformation

The transformation utilities convert data between different formats:

```typescript
/**
 * Convert snake_case keys to camelCase
 * @param obj The object to transform
 * @returns New object with camelCase keys
 */
export function snakeToCamel<T>(obj: Record<string, any>): T {
  // Implementation details
}
```

### Validation

The validation utilities ensure data integrity:

```typescript
/**
 * Validate that a value is a non-empty string
 * @param value The value to validate
 * @param name The parameter name for error messages
 * @throws ValidationError if validation fails
 */
export function validateString(value: any, name: string): void {
  // Implementation details
}
```

### Market Utilities

The market utilities handle market-specific operations:

```typescript
/**
 * Check if the market is currently open
 * @param exchange The exchange to check
 * @returns Boolean indicating if the market is open
 */
export function isMarketOpen(exchange: Exchange = Exchange.HOSE): boolean {
  // Implementation details
}
```

## TypeScript Implementation

In the TypeScript implementation, the Core Utilities are designed with a focus on type safety and reusability.

### Function Design

Functions are designed to be self-contained with clear interfaces:

```typescript
/**
 * Parse a date string into a Date object
 * @param dateStr The date string to parse
 * @param format The expected format (optional)
 * @returns Date object
 */
export function parseDate(dateStr: string, format?: string): Date {
  if (!dateStr) {
    throw new ValidationError('Date string is required');
  }

  try {
    // Use dayjs or similar for reliable date parsing
    if (format) {
      return dayjs(dateStr, format).toDate();
    }
    return dayjs(dateStr).toDate();
  } catch (error) {
    throw new ValidationError(`Invalid date format: ${dateStr}`, {
      cause: error,
    });
  }
}
```

### Error Handling

Error handling follows a consistent pattern with custom error types:

```typescript
/**
 * Base error class for vnstock errors
 */
export class VNStockError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = this.constructor.name;

    // Capture stack trace in Node.js environments
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends VNStockError {
  constructor(message: string, public details?: any) {
    super(message);
  }
}

/**
 * Error thrown when an API request fails
 */
export class ApiError extends VNStockError {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
  }
}
```

## Usage Examples

The Core Utilities are used throughout the vnstock library:

```typescript
import { getLogger, sendRequest, validateSymbol } from 'vnstock/core/utils';

// Using the logger
const logger = getLogger('MyComponent');
logger.info('Initializing component');

// Validating input
function getStockPrice(symbol: string): Promise<number> {
  // Validate input
  validateSymbol(symbol);

  // Make API request
  return sendRequest<{ price: number }>('/api/quote', {
    params: { symbol },
  }).then((response) => response.price);
}
```

## Dependencies

The Core Utilities have minimal external dependencies:

1. HTTP client library (axios or fetch API)
2. Logging library (or console wrapper)
3. Date handling library (dayjs or similar)
4. Basic utility libraries (lodash or similar for complex transformations)

## Implementation Notes

When implementing or extending the Core Utilities:

1. Maintain backward compatibility when modifying existing utilities
2. Write comprehensive unit tests for all utility functions
3. Prioritize performance for frequently used functions
4. Use proper TypeScript typing for maximum type safety
5. Document all functions with JSDoc comments

## References

For detailed implementation of specific utilities, refer to their respective documentation:

- [HTTP Client](./client.md)
- [Environment Utilities](./env.md)
- [Exception Handling](./exceptions.md)
- [Extension Utilities](./ext.md)
- [Help Utilities](./help.md)
- [Launcher Utilities](./launcher.md)
- [Logging Utilities](./logger.md)
- [Market Utilities](./market.md)
- [Parser Utilities](./parser.md)
- [Transformation Utilities](./transform.md)
- [Upgrade Utilities](./upgrade.md)
- [User Agent Management](./user_agent.md)
- [Validation Utilities](./validation.md)
