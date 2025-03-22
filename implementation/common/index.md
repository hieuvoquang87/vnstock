# Common Module Implementation

**Original Python Implementation**: [__init__.py](/vnstock/common/__init__.py)


## Overview

The Common module provides shared functionality and high-level features that integrate various components of the vnstock library. It acts as a bridge between the low-level data access modules (Explorer, Core) and the user interface, offering convenient tools and methods that simplify common financial analysis workflows.

## Purpose

The Common module serves several key purposes:

1. **Unified API**: Provides a simple, cohesive interface that integrates functionality from multiple modules
2. **Data Handling**: Implements utilities for data manipulation, transformation, and processing
3. **Visualization**: Offers plotting and charting capabilities for financial data analysis
4. **Command-line Interface**: Enables interaction with the library through command-line commands
5. **Integration Points**: Provides integration with external tools and platforms

## Structure

The Common module is organized into several submodules:

```
common/
├── data/       - Data handling utilities
├── plot/       - Visualization and charting tools
├── analysis.md - Analysis functionality documentation
├── cli.md      - Command-line interface documentation
├── csv.md      - CSV data handling documentation
├── database.md - Database interaction documentation
├── api.md      - API interface documentation
├── plot.md     - Plotting general documentation
└── vnstock.md  - Core unified API documentation
```

### Data Submodule

The Data submodule handles data exploration, manipulation, and processing:

- Data explorer utilities for interacting with various data sources
- Data transformation and preprocessing functions
- Data validation and normalization tools

### Plot Submodule

The Plot submodule provides visualization and charting capabilities:

- Chart wrapper for creating financial charts
- Plot configuration and customization utilities
- Interactive visualization components

## TypeScript Implementation

In the TypeScript implementation, the Common module serves as the main entry point for most users, providing a high-level API that abstracts away the complexity of the underlying modules.

### Unified API

The main unified API can be implemented as a class that integrates functionality from various modules:

```typescript
/**
 * Main VNStock class that provides a unified API for accessing all functionality
 */
export class VNStock {
  private explorer: Explorer;
  private dataHandler: DataHandler;
  private chartEngine: ChartEngine;

  /**
   * Create a new VNStock instance with default or custom configuration
   * @param config Optional configuration settings
   */
  constructor(config?: VNStockConfig) {
    // Initialize components with proper configuration
  }

  /**
   * Get stock price data
   * @param symbol Stock symbol to fetch data for
   * @param options Additional options for the request
   */
  async getPrice(symbol: string, options?: PriceOptions): Promise<PriceData> {
    // Delegate to appropriate component
  }

  /**
   * Create a chart for the specified data
   * @param data Data to visualize
   * @param options Chart configuration options
   */
  createChart(data: any[], options?: ChartOptions): Chart {
    // Delegate to chart engine
  }

  // Additional methods integrating other functionality
}
```

### Command-line Interface

The CLI component should be implemented with a clear command structure:

```typescript
/**
 * Command-line interface for VNStock
 */
export class VNStockCLI {
  /**
   * Parse and execute the specified command
   * @param args Command-line arguments
   */
  static async execute(args: string[]): Promise<void> {
    // Parse commands and options
    // Execute appropriate functionality
    // Display results
  }
}
```

## Dependencies

The Common module depends on various components of the vnstock library:

1. Explorer module for data access
2. Core module for utilities and configuration
3. External charting libraries for visualization
4. CSV/Excel libraries for data export/import
5. Command-line parsing libraries (for CLI functionality)

## Implementation Notes

When implementing the Common module in TypeScript:

1. Focus on creating a clean, intuitive API that hides implementation details
2. Use TypeScript interfaces to define clear contracts between components
3. Implement proper error handling with detailed error messages
4. Use method chaining and fluent interfaces where appropriate
5. Include comprehensive documentation and examples

## Integration Strategies

The Common module serves as the integration point for various components:

1. **Data Flow Integration**: Connect data sources to visualization components
2. **Configuration Integration**: Share configuration across components
3. **Error Handling Integration**: Provide consistent error handling patterns
4. **API Integration**: Create unified API endpoints that combine multiple operations

## References

For detailed implementation of each submodule, refer to their respective documentation:

- [Data Handling](./data/index.md)
- [Plotting and Visualization](./plot/index.md)
- [Analysis Functionality](./analysis.md)
- [Command-line Interface](./cli.md)
- [CSV Data Handling](./csv.md)
- [Database Integration](./database.md)
- [API Interface](./api.md)
- [Unified API](./vnstock.md)
