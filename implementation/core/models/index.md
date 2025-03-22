# Implementation of Models Module

**Original Python Implementation**: [__init__.py](/vnstock/core/models/__init__.py)


## Overview

The Models Module in `vnstock` provides data validation models used throughout the package to validate, structure, and normalize input data. These models ensure data consistency, provide helpful error messages, and simplify the handling of default values across the codebase. The module primarily uses Pydantic in Python for robust data validation.

## Purpose

The Models Module serves several key purposes:

1. Validating input parameters for API calls and data transformations
2. Enforcing type safety and data integrity throughout the codebase
3. Providing clear error messages when invalid data is supplied
4. Standardizing common data structures used by multiple components
5. Defining schema for data serialization and deserialization
6. Simplifying error handling with predictable model validation

## Python Implementation

In the Python implementation, the models are implemented using Pydantic's `BaseModel` class, which provides automatic data validation, type conversion, and error handling:

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any, Union

class TickerModel(BaseModel):
    """
    Validation model for ticker data inputs.
    Used for validating parameters for historical price data.
    """
    symbol: str
    start: str
    end: Optional[str] = None
    interval: Optional[str] = "1D"

class PaginationModel(BaseModel):
    """
    Validation model for paginated data requests.
    Used for various listing and search endpoints.
    """
    page: int  # Starting page
    size: int  # Results per page
    period: int  # Number of reporting periods to fetch

class FinancialReportModel(BaseModel):
    """
    Validation model for financial report requests.
    Used for retrieving financial statements.
    """
    type: str  # report type: balance_sheet, income_statement, cash_flow, etc.
    frequency: str  # reporting frequency: annual, quarterly
    lang: Optional[str] = "vi"  # language: vi, en
    get_all: Optional[bool] = True  # get all periods or just recent

class CompanyModel(BaseModel):
    """
    Validation model for company information.
    Used to validate and structure company profile data.
    """
    symbol: str
    exchange: Optional[str] = None
    industry: Optional[str] = None

class StockScreenerModel(BaseModel):
    """
    Validation model for stock screening parameters.
    Used to validate search criteria for stock screeners.
    """
    criteria: List[Dict[str, Any]]
    exchange: Optional[str] = "HOSE"
    page: Optional[int] = 1
    size: Optional[int] = 50

class FundModel(BaseModel):
    """
    Validation model for mutual fund data.
    Used for fund-related API endpoints.
    """
    symbol: str
    period: Optional[str] = "1Y"  # 1Y, 3Y, 5Y, 10Y, YTD

class MarketDataModel(BaseModel):
    """
    Validation model for market data requests.
    Used for index and sector data endpoints.
    """
    index: Optional[str] = "VNINDEX"
    start: Optional[str] = None
    end: Optional[str] = None
```

## TypeScript Implementation

For the TypeScript implementation, we'll define interfaces and implement validation functions rather than using classes with built-in validation as in Python. This approach is more idiomatic in TypeScript:

```typescript
/**
 * Interface for ticker data validation
 */
export interface TickerModel {
  symbol: string;
  start: string;
  end?: string | null;
  interval?: string;
}

/**
 * Interface for pagination parameters
 */
export interface PaginationModel {
  page: number;
  size: number;
  period: number;
}

/**
 * Interface for financial report parameters
 */
export interface FinancialReportModel {
  type: string;
  frequency: string;
  lang?: string;
  getAll?: boolean;
}

/**
 * Interface for company information
 */
export interface CompanyModel {
  symbol: string;
  exchange?: string;
  industry?: string;
}

/**
 * Interface for stock screener criteria
 */
export interface StockScreenerModel {
  criteria: Array<Record<string, any>>;
  exchange?: string;
  page?: number;
  size?: number;
}

/**
 * Interface for fund data parameters
 */
export interface FundModel {
  symbol: string;
  period?: string;
}

/**
 * Interface for market data parameters
 */
export interface MarketDataModel {
  index?: string;
  start?: string;
  end?: string;
}

/**
 * Validates a ticker model
 * @param model The ticker model to validate
 * @returns The validated ticker model with defaults applied
 * @throws Error if validation fails
 */
export function validateTickerModel(model: Partial<TickerModel>): TickerModel {
  if (!model.symbol) {
    throw new Error('Symbol is required');
  }

  if (!model.start) {
    throw new Error('Start date is required');
  }

  // Validate symbol format
  const symbol = model.symbol.toUpperCase();

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(model.start)) {
    throw new Error('Start date must be in YYYY-MM-DD format');
  }

  if (model.end && !dateRegex.test(model.end)) {
    throw new Error('End date must be in YYYY-MM-DD format');
  }

  // Default end date to today if not provided
  const end = model.end || new Date().toISOString().split('T')[0];

  // Validate interval if provided
  const validIntervals = ['1D', '1W', '1M', '1H', '4H'];
  const interval = model.interval || '1D';

  if (!validIntervals.includes(interval)) {
    throw new Error(
      `Invalid interval. Must be one of: ${validIntervals.join(', ')}`
    );
  }

  return {
    symbol,
    start: model.start,
    end,
    interval,
  };
}

/**
 * Validates pagination parameters
 * @param model The pagination model to validate
 * @returns The validated pagination model with defaults applied
 * @throws Error if validation fails
 */
export function validatePaginationModel(
  model: Partial<PaginationModel>
): PaginationModel {
  const page = model.page !== undefined ? model.page : 1;
  const size = model.size !== undefined ? model.size : 20;
  const period = model.period !== undefined ? model.period : 5;

  if (page < 1) {
    throw new Error('Page must be greater than or equal to 1');
  }

  if (size < 1 || size > 100) {
    throw new Error('Size must be between 1 and 100');
  }

  if (period < 1) {
    throw new Error('Period must be greater than or equal to 1');
  }

  return { page, size, period };
}

/**
 * Validates financial report parameters
 * @param model The financial report model to validate
 * @returns The validated financial report model with defaults applied
 * @throws Error if validation fails
 */
export function validateFinancialReportModel(
  model: Partial<FinancialReportModel>
): FinancialReportModel {
  if (!model.type) {
    throw new Error('Report type is required');
  }

  if (!model.frequency) {
    throw new Error('Report frequency is required');
  }

  const validTypes = [
    'balance_sheet',
    'income_statement',
    'cash_flow',
    'financial_ratio',
  ];
  if (!validTypes.includes(model.type)) {
    throw new Error(
      `Invalid report type. Must be one of: ${validTypes.join(', ')}`
    );
  }

  const validFrequencies = ['annual', 'quarterly'];
  if (!validFrequencies.includes(model.frequency)) {
    throw new Error(
      `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`
    );
  }

  return {
    type: model.type,
    frequency: model.frequency,
    lang: model.lang || 'vi',
    getAll: model.getAll !== undefined ? model.getAll : true,
  };
}
```

## Usage Examples

### Python Examples

#### Validating Ticker Input Parameters

```python
from vnstock.explorer.tcbs.models import TickerModel
from vnstock.core.utils.validation import validate_symbol, validate_dates

def get_stock_history(symbol, start_date, end_date=None, interval="1D"):
    # Create and validate the model
    ticker = TickerModel(
        symbol=symbol,
        start=start_date,
        end=end_date,
        interval=interval
    )

    # Model validation already happened during creation
    # We can access validated and normalized values
    validated_symbol = ticker.symbol.upper()
    validated_interval = ticker.interval

    # Now use the validated data for API requests
    # ...
```

#### Pagination for Financial Reports

```python
from vnstock.explorer.tcbs.models import PaginationModel
from vnstock.explorer.tcbs.financial import Finance

def get_financial_statements(symbol, page=1, size=4, period=4):
    # Validate pagination parameters
    pagination = PaginationModel(
        page=page,
        size=size,
        period=period
    )

    # Use validated parameters
    finance = Finance(symbol=symbol)
    data = finance.income_statement(
        page=pagination.page,
        size=pagination.size,
        period=pagination.period
    )

    return data
```

### TypeScript Examples

#### Validating Ticker Input Parameters

```typescript
import { TickerModel, validateTickerModel } from './models';
import { fetchHistoricalData } from './api';

async function getStockHistory(
  symbol: string,
  startDate: string,
  endDate?: string,
  interval: string = '1D'
): Promise<any> {
  try {
    // Validate input parameters
    const ticker = validateTickerModel({
      symbol,
      start: startDate,
      end: endDate,
      interval,
    });

    // Use validated parameters for API request
    const data = await fetchHistoricalData(ticker);
    return data;
  } catch (error) {
    console.error(`Error in getStockHistory: ${error.message}`);
    throw error;
  }
}
```

#### Stock Screener Parameters

```typescript
import { StockScreenerModel } from './models';
import { executeScreener } from './api';

async function screenStocks(
  criteria: Array<Record<string, any>>,
  exchange: string = 'HOSE',
  page: number = 1,
  size: number = 50
): Promise<any> {
  // Create model with parameters
  const model: StockScreenerModel = {
    criteria,
    exchange,
    page,
    size,
  };

  // Validate criteria structure
  model.criteria.forEach((criterion) => {
    if (
      !criterion.field ||
      !criterion.operation ||
      criterion.value === undefined
    ) {
      throw new Error(
        'Each criterion must contain field, operation, and value'
      );
    }
  });

  // Execute the screener with validated model
  return executeScreener(model);
}
```

## Implementation Details

### Model Field Types

1. **Simple Types**: string, number, boolean
2. **Date Fields**: Stored as strings in "YYYY-MM-DD" format
3. **Enumerated Types**: Fields that accept specific values only
4. **Nested Objects**: Complex structures like criteria lists
5. **Optional Fields**: Fields with default values or that can be omitted

### Validation Strategies

1. **Type Validation**: Ensuring values have the correct types
2. **Format Validation**: Checking formats like date strings
3. **Range Validation**: Ensuring numeric values are within acceptable ranges
4. **Enumeration Validation**: Ensuring values belong to a defined set
5. **Cross-field Validation**: Checking for logical relationship between fields

### Python-TypeScript Differences

1. **Dynamic vs Static Typing**: Python uses runtime validation, TypeScript uses compile-time typing
2. **Default Values**: In Python, Pydantic handles defaults, in TypeScript we use default parameters or object defaults
3. **Error Handling**: Python raises ValidationError, TypeScript uses custom error handling
4. **Nested Validation**: Python handles nested validation automatically, TypeScript requires custom validation logic

### Extending the Model System

To extend the model system with new models:

1. **Identify Requirements**: Determine what data needs validation
2. **Define Fields**: List required and optional fields with their types
3. **Add Validation Logic**: Define validation rules for each field
4. **Implement Error Messages**: Create clear, helpful error messages
5. **Test Edge Cases**: Validate with invalid inputs to ensure error handling works

## Dependencies

### Python Dependencies

- `pydantic`: Primary library for data validation
- `typing`: For type hints and annotations
- `datetime`: For date/time validation and manipulation

### TypeScript Dependencies

- TypeScript's built-in type system
- No external dependencies required, but you could optionally use:
  - `zod`: Schema validation library
  - `yup`: Object schema validation
  - `class-validator`: Decorator-based validation

## Implementation Notes

1. **Performance Considerations**: Validation adds overhead, so cache validated models when appropriate
2. **Error Messages**: Make error messages clear and actionable for end users
3. **Documentation**: Document model fields clearly for API users
4. **Extensibility**: Design models to be extensible for future requirements
5. **Compatibility**: Ensure models can handle changes to API responses gracefully
6. **Testing**: Test models with both valid and invalid inputs to verify validation logic
7. **Serialization**: Consider how models will be serialized to/from JSON or other formats
8. **Defaults**: Choose sensible defaults for optional fields
