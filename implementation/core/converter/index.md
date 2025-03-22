# Core Converter Module Implementation

**Original Python Implementation**: [__init__.py](/vnstock/core/converter/__init__.py)


## Overview

The Core Converter module provides functionality for converting and exporting data between different formats in the vnstock library. This module handles the transformation of financial data into various output formats such as CSV, Excel, JSON, and other structured formats, making it easy for users to work with the data in their preferred tools and workflows.

## Purpose

The Core Converter module serves several key purposes:

1. **Data Export**: Enables exporting data to common file formats (CSV, Excel, JSON)
2. **Format Conversion**: Transforms data between different structured formats
3. **Serialization**: Converts complex objects to serializable formats
4. **Normalization**: Standardizes data formats across different sources
5. **Integration**: Facilitates integration with external tools and systems

## Structure

The Core Converter module contains the following components:

```
core/converter/
├── export.md      - Data export functionality
├── format.md      - Format conversion utilities
└── normalize.md   - Data normalization functions
```

## TypeScript Implementation

In the TypeScript implementation, the Core Converter module provides a set of utility functions and classes for data conversion and export.

### Export Functionality

The export functionality can be implemented using a factory pattern:

```typescript
/**
 * Supported export formats
 */
export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  HTML = 'html',
}

/**
 * Export options interface
 */
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  delimiter?: string; // For CSV
  sheetName?: string; // For Excel
  pretty?: boolean; // For JSON
}

/**
 * Factory for creating data exporters
 */
export class ExporterFactory {
  /**
   * Create an exporter for the specified format
   * @param format Export format
   * @returns DataExporter instance
   */
  static createExporter(format: ExportFormat): DataExporter {
    switch (format) {
      case ExportFormat.CSV:
        return new CsvExporter();
      case ExportFormat.EXCEL:
        return new ExcelExporter();
      case ExportFormat.JSON:
        return new JsonExporter();
      case ExportFormat.HTML:
        return new HtmlExporter();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}

/**
 * Base interface for data exporters
 */
export interface DataExporter {
  /**
   * Export data to the specified format
   * @param data Data to export
   * @param options Export options
   * @returns Exported data or file path
   */
  export(data: any[], options?: Partial<ExportOptions>): Promise<string>;
}
```

### Format Conversion

Format conversion utilities can be implemented as standalone functions:

```typescript
/**
 * Convert an array of objects to CSV format
 * @param data Array of objects to convert
 * @param options CSV conversion options
 * @returns CSV string
 */
export function convertToCsv(
  data: Record<string, any>[],
  options: {
    delimiter?: string;
    includeHeaders?: boolean;
    columns?: string[];
  } = {}
): string {
  if (!data || data.length === 0) {
    return '';
  }

  const delimiter = options.delimiter || ',';
  const includeHeaders = options.includeHeaders !== false;

  // Determine columns to include
  const columns = options.columns || Object.keys(data[0]);

  // Generate headers
  let csv = '';
  if (includeHeaders) {
    csv = columns.join(delimiter) + '\n';
  }

  // Generate rows
  for (const row of data) {
    const values = columns.map((column) => {
      const value = row[column];
      // Handle special cases (commas, quotes, etc.)
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'string' && value.includes(delimiter)) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csv += values.join(delimiter) + '\n';
  }

  return csv;
}
```

### Normalization Functions

Normalization functions standardize data across different sources:

```typescript
/**
 * Normalize date formats across different data sources
 * @param dateValue Date value from API
 * @param sourceFormat Format of the source date (if known)
 * @returns Standardized Date object
 */
export function normalizeDate(
  dateValue: string | number | Date,
  sourceFormat?: string
): Date {
  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === 'number') {
    // Handle timestamp
    return new Date(dateValue);
  }

  if (typeof dateValue === 'string') {
    // Handle string date with known format
    if (sourceFormat) {
      return dayjs(dateValue, sourceFormat).toDate();
    }

    // Try to parse with various formats
    return dayjs(dateValue).toDate();
  }

  throw new Error(`Cannot normalize date: ${dateValue}`);
}

/**
 * Normalize financial values (e.g., convert strings to numbers)
 * @param value Financial value to normalize
 * @returns Normalized number
 */
export function normalizeFinancialValue(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    // Remove thousand separators and other non-numeric characters
    const normalizedString = value.replace(/[^\d.-]/g, '').replace(/,/g, '');

    const parsedValue = parseFloat(normalizedString);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }

  return 0;
}
```

## Usage Examples

The Core Converter module can be used as follows:

```typescript
import {
  ExporterFactory,
  ExportFormat,
  convertToCsv,
  normalizeDate,
} from 'vnstock/core/converter';

// Export data to CSV
async function exportStockData(stockData: any[]): Promise<string> {
  const exporter = ExporterFactory.createExporter(ExportFormat.CSV);

  const filepath = await exporter.export(stockData, {
    filename: 'stock_data.csv',
    includeHeaders: true,
    delimiter: ',',
  });

  return filepath;
}

// Convert data to CSV manually
function convertDataToCsv(data: any[]): string {
  const csv = convertToCsv(data, {
    includeHeaders: true,
    columns: ['symbol', 'date', 'price', 'volume'],
  });

  return csv;
}

// Normalize dates in data
function processDates(data: any[]): any[] {
  return data.map((item) => ({
    ...item,
    date: normalizeDate(item.date, 'YYYY-MM-DD'),
  }));
}
```

## Integration with Other Modules

The Core Converter module integrates with several other modules:

1. **Explorer Module**: Converts API responses to standardized formats
2. **Common Module**: Provides export functionality for UI components
3. **Core Utilities**: Uses utility functions for data manipulation
4. **Models**: Works with data validation models for type conversion

## Implementation Best Practices

When implementing data conversion and export functionality:

1. **Memory Efficiency**: Handle large datasets without excessive memory usage
2. **Error Handling**: Provide clear error messages for conversion failures
3. **Performance**: Optimize conversion algorithms for speed
4. **Type Safety**: Use TypeScript's type system to ensure correct transformations
5. **Extensibility**: Make it easy to add new export formats in the future

## Dependencies

The Core Converter module has the following dependencies:

1. CSV parsing/generation library (or custom implementation)
2. Excel generation library (e.g., ExcelJS, xlsx)
3. Date manipulation library (e.g., dayjs)
4. File system utilities for saving exports

## Implementation Notes

When implementing or extending the Core Converter module:

1. Support both browser and Node.js environments where possible
2. Implement streaming for large datasets to avoid memory issues
3. Provide progress reporting for time-consuming conversions
4. Handle special cases like circular references in JSON conversion
5. Ensure proper character encoding for international text

## References

For detailed implementation of specific converter components, refer to:

- [Data Export Functionality](./export.md)
- [Format Conversion Utilities](./format.md)
- [Data Normalization Functions](./normalize.md)
