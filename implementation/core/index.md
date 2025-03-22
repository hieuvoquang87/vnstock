# Core Module Implementation

**Original Python Implementation**: [vnstock/core/**init**.py](/vnstock/core/__init__.py)

## Overview

The Core module provides the foundational functionality that supports the entire vnstock library. It contains essential utilities, configuration settings, and shared components that are used across all other modules. This module implements the infrastructure that enables the library to function effectively while providing consistent behavior.

## Purpose

The Core module serves several key purposes:

1. **Base Functionality**: Provides essential utilities and helpers used throughout the library
2. **Configuration Management**: Manages global settings, constants, and environment configurations
3. **HTTP Communication**: Handles API requests, response parsing, and error handling
4. **Data Transformation**: Provides utilities for converting data between different formats
5. **Logging and Debugging**: Implements logging infrastructure for troubleshooting and monitoring

## Structure

The Core module is organized into several submodules:

```
core/
├── utils/      - Utility functions and helpers
├── config/     - Configuration settings and constants
├── converter/  - Data format conversion utilities
└── models/     - Shared data models and interfaces
```

### Utils Submodule

The Utils submodule contains utility functions that provide common functionality across the library:

- HTTP client for making API requests
- Logging utilities for debugging and monitoring
- Data parsing and transformation utilities
- Environment utilities for managing configuration
- Market utilities for handling trading hours and sessions

### Config Submodule

The Config submodule manages configuration settings and constants used throughout the library:

- API endpoints and URLs
- Default parameters and settings
- Feature flags and toggles
- Environment-specific configurations

### Converter Submodule

The Converter submodule provides utilities for converting data between different formats:

- Data export functionality (CSV, Excel, JSON)
- Format conversion utilities
- Data normalization functions

### Models Submodule

The Models submodule defines shared data models and interfaces used across the library:

- Data validation models
- Input parameter definitions
- Response type definitions
- Common data structures

## TypeScript Implementation

In the TypeScript implementation, the Core module leverages TypeScript's type system to provide robust type safety while maintaining flexibility.

### Utility Functions

The utility functions should be implemented as standalone functions with proper typing:

```typescript
/**
 * Sends an HTTP request to the specified URL with error handling
 * @param url The URL to send the request to
 * @param options Request options including method, headers, and body
 * @returns Promise resolving to the response data
 */
export async function sendRequest<T>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  // Implementation
}
```

### Configuration Management

Configuration should be implemented using TypeScript interfaces and constants:

```typescript
/**
 * API configuration settings
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'https://api.example.com',
  timeout: 30000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
```

## Dependencies

The Core module has minimal external dependencies to reduce the risk of dependency issues:

1. Libraries for HTTP requests (axios or fetch API)
2. Logging library (optional, could use built-in console)
3. Date/time utilities (dayjs or native Date)
4. Data transformation utilities (lodash or similar)

## Implementation Notes

When implementing the Core module in TypeScript:

1. Use TypeScript's advanced type system (generics, unions, intersections) for maximum type safety
2. Implement proper error handling with custom error types and detailed error messages
3. Use dependency injection where appropriate to improve testability
4. Consider lazy initialization for performance-critical components
5. Implement proper documentation using JSDoc comments

## Usage Examples

### Basic Library Initialization

```typescript
import { initialize } from 'vnstock/core';

// Initialize the library with default configuration
const vnstock = initialize();

// The library is now ready to use
console.log('VNStock library initialized successfully');
```

### Using Core Utilities

```typescript
import { sendRequest } from 'vnstock/core/utils/client';
import { parseDate, formatDate } from 'vnstock/core/utils/transform';

// Send a request to an API endpoint
const data = await sendRequest('https://api.example.com/data', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
});

// Parse and format a date
const date = parseDate('2023-01-15');
const formattedDate = formatDate(date, 'DD/MM/YYYY');
console.log(formattedDate); // Outputs: 15/01/2023
```

### Working with Configuration

```typescript
import { getConfig, updateConfig } from 'vnstock/core/config';

// Get current configuration
const config = getConfig();
console.log(`Current API timeout: ${config.api.timeout}ms`);

// Update configuration
updateConfig({
  api: {
    timeout: 60000,
    retries: 5,
  },
  logging: {
    level: 'debug',
  },
});

console.log(`New API timeout: ${getConfig().api.timeout}ms`);
```

## References

For detailed implementation of each submodule, refer to their respective documentation:

- [Utils Submodule](./utils/index.md)
- [Config Submodule](./config/index.md)
- [Converter Submodule](./converter/index.md)
- [Models Submodule](./models/index.md)
