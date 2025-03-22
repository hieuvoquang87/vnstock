# Explorer Module Implementation

**Original Python Implementation**: [__init__.py](/vnstock/explorer/__init__.py)


## Overview

The Explorer module is the central component of vnstock that provides access to various data sources, enabling users to retrieve financial market data from different providers. This module implements an adapter pattern, allowing the library to interface with multiple data sources while providing a consistent API to the end user.

## Purpose

The Explorer module serves several key purposes:

1. **Data Source Abstraction**: Provides a consistent interface across different data providers
2. **Efficient Data Retrieval**: Implements optimized methods for fetching financial data
3. **Centralized Configuration**: Manages data source settings and API endpoints
4. **Error Handling**: Provides robust error handling for API requests
5. **Data Transformation**: Normalizes data formats across different sources

## Structure

The Explorer module is organized into submodules based on data sources:

```
explorer/
├── vci/       - VCI data source (broker platform)
├── tcbs/      - TCBS data source (broker platform)
├── fmarket/   - FMARKET data source (mutual funds)
├── msn/       - MSN data source (international markets)
└── misc/      - Miscellaneous data sources
```

Each data source submodule implements a consistent set of features:

- Company information
- Financial data and ratios
- Price and quote data
- Trading data and statistics
- Listing and symbol information
- Data validation models
- Constants and mappings

## TypeScript Implementation

In the TypeScript implementation, the Explorer module follows a similar structure to the Python version but with enhancements specific to TypeScript's ecosystem.

### Data Source Structure

Each data source should implement the following interface pattern:

```typescript
interface DataSource {
  // Core data access methods
  quote(symbol: string, options?: QuoteOptions): Promise<QuoteData>;
  company(symbol: string): Promise<CompanyData>;
  financial(symbol: string, options?: FinancialOptions): Promise<FinancialData>;
  trading(symbol: string, options?: TradingOptions): Promise<TradingData>;
  listing(options?: ListingOptions): Promise<ListingData>;

  // Source-specific methods
  // (implemented by individual data sources)
}
```

### Factory Pattern

The TypeScript implementation should utilize a factory pattern to create data source instances:

```typescript
class ExplorerFactory {
  static getDataSource(source: DataSourceType): DataSource {
    switch (source) {
      case 'VCI':
        return new VCIDataSource();
      case 'TCBS':
        return new TCBSDataSource();
      case 'FMARKET':
        return new FMarketDataSource();
      case 'MSN':
        return new MSNDataSource();
      default:
        throw new Error(`Unsupported data source: ${source}`);
    }
  }
}
```

## Using the Explorer Module

The Explorer module is designed to be used through a simple, consistent API:

```typescript
import { Explorer } from 'vnstock';

// Create an explorer with a specific data source
const explorer = Explorer.create('VCI');

// Retrieve stock price data
const price = await explorer.quote('VNM');

// Get company information
const company = await explorer.company('VNM');

// Retrieve financial statements
const financial = await explorer.financial('VNM', {
  type: 'quarterly',
  reportType: 'incomeStatement',
});
```

## Dependencies

The Explorer module has the following dependencies:

1. Core utilities (`core/utils`): HTTP client, logging, data transformation
2. Models (`core/models`): Data validation and type definitions
3. Configuration (`core/config`): Constants and settings

## Implementation Notes

When implementing the Explorer module in TypeScript:

1. Use TypeScript interfaces to define data structures for each data source
2. Implement proper error handling for API requests and responses
3. Use type guards to ensure type safety when processing API responses
4. Consider implementing caching to improve performance
5. Use dependency injection for better testability

## References

For detailed implementation of each data source, refer to their respective documentation:

- [VCI Explorer](./vci/index.md)
- [TCBS Explorer](./tcbs/index.md)
- [FMARKET Explorer](./fmarket/index.md)
- [MSN Explorer](./msn/index.md)
- [Miscellaneous Data Sources](./misc/index.md)
