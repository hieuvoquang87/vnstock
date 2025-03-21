# TypeScript Implementation Notes for vnstock

## Overview

This document provides key considerations, implementation differences, and special attention areas when converting the vnstock Python package to TypeScript. It serves as a supplement to the detailed implementation documentation, highlighting Python-to-TypeScript conversion challenges and strategies.

## General Conversion Principles

1. **Asynchronous Operations**

   - Python: Uses both synchronous code and async/await
   - TypeScript: Should consistently use Promise-based async/await for all API operations
   - Note: Convert Python's synchronous HTTP requests to TypeScript's Promise-based approach

2. **Type Safety**

   - Python: Uses type hints but still allows dynamic typing
   - TypeScript: Enforces strict typing with interfaces and type definitions
   - Note: Define comprehensive interfaces for all data structures and API responses

3. **Module Structure**

   - Python: Uses relative imports and implicit namespace packages
   - TypeScript: Uses explicit imports with path declarations and module resolution
   - Note: Restructure imports to align with TypeScript module patterns

4. **Error Handling**
   - Python: Uses exceptions with specific error types
   - TypeScript: Should use Promise rejections with structured error objects
   - Note: Convert Python exception hierarchies to TypeScript error classes

## Core Components

### API Utilities

**Key Differences:**

- Python uses `requests` while TypeScript uses `axios` or `fetch`
- Python exception handling needs conversion to Promise rejections
- TypeScript requires explicit typing of request/response objects

**Special Attention:**

```typescript
// Python synchronous approach
try:
    response = requests.get(url, headers=headers)
    data = response.json()
except RequestException as e:
    raise ConnectionError(f"API request failed: {str(e)}")

// TypeScript Promise-based approach
try {
  const response = await axios.get(url, { headers });
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new ConnectionError(`API request failed: ${error.message}`);
  }
  throw error;
}
```

### Data Handling

**Key Differences:**

- Python uses pandas DataFrames extensively
- TypeScript should use array-based data structures with type interfaces
- Many pandas operations need custom implementation in TypeScript

**Special Attention:**

```typescript
// Python pandas operations
df = pd.DataFrame(data);
filtered_df = df[df['column'] > threshold];
grouped = df.groupby('category').agg({ value: 'sum' });

// TypeScript array operations
interface DataItem {
  column: number;
  category: string;
  value: number;
}

const items: DataItem[] = data;
const filtered = items.filter((item) => item.column > threshold);
const grouped = items.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = 0;
  acc[item.category] += item.value;
  return acc;
}, {} as Record<string, number>);
```

### Logging

**Key Differences:**

- Python uses built-in logging module with hierarchical loggers
- TypeScript should implement a similar logging interface

**Special Attention:**

```typescript
// Python logging configuration
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

// TypeScript logging implementation
interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  error(message: string): void;
}

class LoggerImpl implements Logger {
  private name: string;
  private level: LogLevel;

  constructor(name: string, level: LogLevel = LogLevel.INFO) {
    this.name = name;
    this.level = level;
  }

  // Implementation methods...
}
```

## Domain-Specific Components

### Stock Data Components

**Key Differences:**

- Python uses class-based components with inheritance
- TypeScript should follow similar patterns with interface implementations
- Date handling differs significantly between Python and TypeScript

**Special Attention:**

```typescript
// Python date handling
from datetime import datetime, timedelta
start_date = datetime.now() - timedelta(days=30)
date_str = start_date.strftime('%Y-%m-%d')

// TypeScript date handling with dayjs
import dayjs from 'dayjs';
const startDate = dayjs().subtract(30, 'day');
const dateStr = startDate.format('YYYY-MM-DD');
```

### Chart Generation

**Key Differences:**

- Python uses matplotlib or plotly
- TypeScript should use chart.js, d3.js, or other browser-compatible libraries
- Data transformation for visualization differs significantly

**Special Attention:**

- Replace Python's server-side rendering with client-side chart libraries
- Implement data transformation utilities to convert API responses to chart-compatible formats
- Consider using TypeScript wrapper libraries for popular charting solutions

### Data Analysis

**Key Differences:**

- Python uses numpy for numerical operations
- TypeScript needs custom implementation or libraries like mathjs
- Statistical functions require special attention

**Special Attention:**

```typescript
// Python numpy operations
import numpy as np
mean = np.mean(data)
std_dev = np.std(data)
correlation = np.corrcoef(x, y)[0, 1]

// TypeScript implementation
function mean(data: number[]): number {
  return data.reduce((sum, value) => sum + value, 0) / data.length;
}

function stdDev(data: number[]): number {
  const avg = mean(data);
  const squareDiffs = data.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

function correlation(x: number[], y: number[]): number {
  // Custom implementation...
}
```

## Component-Specific Notes

### Notification Module

**Key Differences:**

- Python's form handling for file uploads differs from TypeScript's
- Error handling and validation approaches vary

**Special Attention:**

- Use form-data package for multipart form handling in TypeScript
- Implement proper file reading with Node.js fs module or browser File API
- Add additional validation for platform-specific API requirements

### Financial Data Module

**Key Differences:**

- Data transformation from API responses to structured data
- Type safety for financial calculations

**Special Attention:**

- Define comprehensive interfaces for financial data structures
- Implement precise decimal handling for financial calculations
- Ensure consistent date formatting across all financial data

### Explorer Modules

**Key Differences:**

- GraphQL handling differs between Python and TypeScript
- API response transformation logic

**Special Attention:**

- Consider using Apollo Client for GraphQL operations in TypeScript
- Implement robust type checking for various data sources
- Maintain consistent error handling across different data providers

## Implementation Challenges

### 1. Pandas Functionality Replacement

Python's pandas library provides extensive data manipulation capabilities that need custom implementation in TypeScript:

**Key Strategies:**

- Implement basic DataFrame-like functionality with TypeScript interfaces and array methods
- Use libraries like lodash for common data transformation operations
- Create utilities for common operations like filtering, grouping, and pivoting

### 2. Asynchronous Flow Control

Converting Python's mix of synchronous and asynchronous code to TypeScript's Promise-based approach:

**Key Strategies:**

- Consistently use async/await pattern throughout the codebase
- Implement proper Promise chaining and error handling
- Add cancellation token support for long-running operations

### 3. Type Safety for Dynamic Data

Handling dynamic API responses with TypeScript's static type system:

**Key Strategies:**

- Define comprehensive interface hierarchies for API responses
- Use type guards and discriminated unions for variant data structures
- Implement proper type assertion and validation utilities

### 4. Browser vs. Node.js Environments

Supporting both browser and Node.js environments:

**Key Strategies:**

- Use environment detection for platform-specific code
- Implement environment-agnostic interfaces with environment-specific implementations
- Use polyfills or adaptation layers for environment-specific APIs

### 5. Decimal Precision Handling

Ensuring precise decimal calculations for financial data:

**Key Strategies:**

- Use decimal.js or similar library for financial calculations
- Implement proper rounding and formatting utilities
- Add validation for financial data to ensure precision

## Module-Specific Implementation Priorities

1. **Core Utilities**

   - API client implementation
   - Logging system
   - Error handling framework

2. **Data Structures**

   - DataFrame-like interfaces and implementations
   - Type definitions for all data models

3. **Financial Data Components**

   - Stock data interfaces
   - Quote and pricing components
   - Financial statement models

4. **Visualization Components**

   - Chart data transformation utilities
   - Rendering adapters for different chart libraries

5. **Integration Modules**
   - API connectors for different data sources
   - Authentication and session management

## Testing Considerations

1. **API Mocking**

   - Create mock implementations for all external APIs
   - Use dependency injection for testable components

2. **Unit Testing**

   - Test data transformation logic
   - Verify type conversions and validations

3. **Integration Testing**
   - Test full data flow from API to rendered output
   - Verify error handling across component boundaries

## Optimization Strategies

1. **Bundle Size**

   - Implement tree-shaking friendly module structure
   - Use dynamic imports for optional components

2. **Performance**

   - Optimize data transformation operations
   - Implement caching for API responses and calculations

3. **Memory Management**
   - Avoid memory leaks in data processing pipelines
   - Implement proper cleanup for subscriptions and event listeners

## Conclusion

The conversion from Python to TypeScript requires careful attention to language-specific differences, particularly in the areas of asynchronous operations, type safety, and data manipulation. By following these guidelines and focusing on the highlighted areas, developers can successfully implement the vnstock functionality in TypeScript while maintaining the same capabilities and adding type safety benefits.
