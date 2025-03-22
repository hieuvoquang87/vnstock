# VCI Models Implementation

**Original Python Implementation**: [models.py](/vnstock/explorer/vci/models.py)


## Overview

The `models.py` file defines data validation models for VCI data source using Pydantic. These models are used to validate and structure input data before making API requests.

## Classes

### TickerModel

This class defines the structure for ticker symbol data with validation.

#### Properties

- `symbol`: Required string representing the stock symbol (e.g., "VCB", "HPG")
- `start`: Required string representing the start date in "YYYY-MM-DD" format
- `end`: Optional string representing the end date in "YYYY-MM-DD" format (defaults to None)
- `interval`: Optional string representing the time interval for data (defaults to "1D")

## Implementation Details

### Type System

In Python, the implementation uses Pydantic's `BaseModel` for data validation. When implementing in another language, you should:

1. Create a class/interface that validates:

   - `symbol` is a non-empty string
   - `start` is a valid date string in "YYYY-MM-DD" format
   - `end` is either null or a valid date string in "YYYY-MM-DD" format
   - `interval` is a string defaulting to "1D"

2. If the target language doesn't have built-in validation libraries like Pydantic, implement custom validation logic to check:
   - Date strings are in the correct format
   - Required fields are present
   - Date ranges are valid (start date is not after end date)

### TypeScript Implementation Example

```typescript
/**
 * Model for validating ticker input data for VCI data source
 */
export interface TickerModel {
  symbol: string;
  start: string;
  end?: string | null;
  interval?: string;
}

/**
 * Validates a ticker model
 * @param model The ticker model to validate
 * @returns The validated ticker model with defaults applied
 * @throws Error if validation fails
 */
export function validateTickerModel(model: TickerModel): TickerModel {
  if (!model.symbol || model.symbol.trim() === '') {
    throw new Error('Symbol is required');
  }

  // Validate start date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(model.start)) {
    throw new Error('Start date must be in YYYY-MM-DD format');
  }

  // Validate end date format if provided
  if (model.end && !/^\d{4}-\d{2}-\d{2}$/.test(model.end)) {
    throw new Error('End date must be in YYYY-MM-DD format');
  }

  // Apply defaults
  return {
    symbol: model.symbol.toUpperCase(),
    start: model.start,
    end: model.end || null,
    interval: model.interval || '1D',
  };
}
```

## Dependencies

- In Python: Pydantic, datetime, typing (Optional)
- In other languages: Equivalent validation libraries or custom validation logic

## Notes

- The model is intentionally simple but can be extended with additional validation rules as needed
- When implementing in strongly-typed languages, consider creating proper enums for the interval values
