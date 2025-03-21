# Implementation of CSV Handling

## Overview

The CSV handling module provides utilities for importing and exporting data in CSV format. While the Python implementation leverages pandas' built-in CSV functionality, the TypeScript implementation requires dedicated utilities to handle CSV operations efficiently.

## Purpose

CSV (Comma-Separated Values) is a common format for data exchange, particularly for financial data. This module serves several purposes:

1. Exporting financial data to CSV files for analysis in other tools
2. Importing CSV data that might be provided by third-party sources
3. Providing consistent interfaces for CSV operations across the application

## Python Implementation

In the Python implementation, CSV handling is primarily accomplished through pandas' built-in functions:

```python
import pandas as pd
from typing import Dict, List, Any, Optional, Union
import os

def export_to_csv(data: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]],
                  filepath: str,
                  index: bool = False,
                  **kwargs) -> None:
    """
    Export data to a CSV file.

    Parameters:
    - data: Data to export (DataFrame, dictionary, or list of dictionaries)
    - filepath: Path to save the CSV file
    - index: Whether to include the index in the output
    - **kwargs: Additional parameters to pass to pandas to_csv method

    Returns:
    - None
    """
    # Create directory if it doesn't exist
    directory = os.path.dirname(filepath)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

    # Convert data to DataFrame if needed
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    elif isinstance(data, list) and all(isinstance(item, dict) for item in data):
        df = pd.DataFrame(data)
    elif isinstance(data, pd.DataFrame):
        df = data
    else:
        raise ValueError("Data must be a DataFrame, dictionary, or list of dictionaries")

    # Export to CSV
    df.to_csv(filepath, index=index, **kwargs)
    print(f"Data exported to {filepath}")

def import_from_csv(filepath: str, **kwargs) -> pd.DataFrame:
    """
    Import data from a CSV file.

    Parameters:
    - filepath: Path to the CSV file
    - **kwargs: Additional parameters to pass to pandas read_csv method

    Returns:
    - DataFrame containing the data
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    # Import CSV data
    df = pd.read_csv(filepath, **kwargs)
    return df
```

## TypeScript Implementation

For TypeScript, we need to implement more functionality since there's no direct equivalent to pandas. We'll use a combination of Node.js built-in modules and external libraries for optimal performance.

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { parse as csvParse, stringify as csvStringify } from 'csv-parse/sync';

/**
 * Options for exporting data to CSV
 */
export interface CsvExportOptions {
  /** Whether to include headers (column names) */
  headers?: boolean;
  /** Custom column headers to use (overrides data keys) */
  customHeaders?: string[];
  /** Delimiter character (default: ',') */
  delimiter?: string;
  /** Quote character for strings (default: '"') */
  quote?: string;
  /** Whether to include the record index */
  includeIndex?: boolean;
  /** Columns to include (if not specified, includes all columns) */
  columns?: string[];
  /** Encoding for the output file (default: 'utf8') */
  encoding?: BufferEncoding;
}

/**
 * Options for importing data from CSV
 */
export interface CsvImportOptions {
  /** Whether the CSV has headers */
  headers?: boolean | string[];
  /** Delimiter character (default: ',') */
  delimiter?: string;
  /** Quote character for strings (default: '"') */
  quote?: string;
  /** Skip first N lines */
  skipLines?: number;
  /** Encoding of the input file (default: 'utf8') */
  encoding?: BufferEncoding;
  /** Whether to trim whitespace from values */
  trim?: boolean;
  /** Parse numeric values to numbers */
  parseNumbers?: boolean;
  /** Map of column transformations */
  columnTransforms?: Record<string, (value: string) => any>;
}

/**
 * Export data to a CSV file
 *
 * @param data - Data to export (object, array of objects, or array of arrays)
 * @param filepath - Path to save the CSV file
 * @param options - Export options
 * @returns Promise that resolves when the export is complete
 */
export async function exportToCsv(
  data: Record<string, any>[] | any[][] | Record<string, any>,
  filepath: string,
  options: CsvExportOptions = {}
): Promise<void> {
  // Create directory if it doesn't exist
  const directory = path.dirname(filepath);
  if (directory && !fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Default options
  const {
    headers = true,
    customHeaders,
    delimiter = ',',
    quote = '"',
    includeIndex = false,
    columns,
    encoding = 'utf8',
  } = options;

  // Handle single object case
  const dataArray = Array.isArray(data) ? data : [data];

  // If data is empty, create empty file with headers
  if (dataArray.length === 0) {
    if (headers && customHeaders) {
      await fs.promises.writeFile(filepath, customHeaders.join(delimiter), {
        encoding,
      });
    } else {
      await fs.promises.writeFile(filepath, '', { encoding });
    }
    console.log(`Empty CSV file created at ${filepath}`);
    return;
  }

  let csvData: any[][];
  let headerRow: string[] | undefined;

  // Handle array of objects (most common case)
  if (typeof dataArray[0] === 'object' && !Array.isArray(dataArray[0])) {
    const records = dataArray as Record<string, any>[];

    // Determine columns to include
    const allColumns =
      columns ||
      Array.from(new Set(records.flatMap((record) => Object.keys(record))));

    // Create header row
    headerRow = customHeaders || allColumns;

    // Convert objects to arrays based on columns
    csvData = records.map((record, index) => {
      const row = allColumns.map((col) => {
        const value = record[col];
        return value === undefined || value === null ? '' : value;
      });

      // Add index column if requested
      if (includeIndex) {
        row.unshift(index);
      }

      return row;
    });

    // Add index header if needed
    if (includeIndex && headerRow) {
      headerRow.unshift('index');
    }
  } else {
    // Data is already in array format
    csvData = dataArray as any[][];

    if (customHeaders) {
      headerRow = customHeaders;
    }
  }

  // Create CSV string
  const csvOptions = {
    delimiter,
    quoted: true,
    quote,
    header: headers && headerRow ? true : false,
    columns: headerRow,
  };

  const csvString =
    csvStringify(
      headers && headerRow
        ? [Object.fromEntries(headerRow.map((h, i) => [h, h]))]
        : [],
      csvOptions
    ) + csvStringify(csvData, { ...csvOptions, header: false });

  // Write to file
  await fs.promises.writeFile(filepath, csvString, { encoding });
  console.log(`Data exported to ${filepath}`);
}

/**
 * Import data from a CSV file
 *
 * @param filepath - Path to the CSV file
 * @param options - Import options
 * @returns Promise resolving to an array of objects representing the CSV data
 */
export async function importFromCsv<T = Record<string, any>>(
  filepath: string,
  options: CsvImportOptions = {}
): Promise<T[]> {
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }

  // Default options
  const {
    headers = true,
    delimiter = ',',
    quote = '"',
    skipLines = 0,
    encoding = 'utf8',
    trim = true,
    parseNumbers = true,
    columnTransforms = {},
  } = options;

  // Read file content
  const fileContent = await fs.promises.readFile(filepath, { encoding });

  // Parse CSV
  const parseOptions = {
    delimiter,
    quote,
    skip_empty_lines: true,
    trim,
    from_line: skipLines + 1,
    columns: headers,
    cast: parseNumbers
      ? (value: string, context: any) => {
          // Try to convert to number if it looks like one
          if (/^-?\d+(\.\d+)?$/.test(value)) {
            return Number(value);
          }
          return value;
        }
      : undefined,
  };

  // Parse the CSV content
  const records = csvParse(fileContent, parseOptions) as T[];

  // Apply column transformations if any
  if (Object.keys(columnTransforms).length > 0) {
    return records.map((record) => {
      const transformed = { ...record };
      for (const [column, transform] of Object.entries(columnTransforms)) {
        if (column in transformed) {
          transformed[column] = transform(transformed[column]);
        }
      }
      return transformed;
    });
  }

  return records;
}

/**
 * Convert data to CSV string without writing to a file
 *
 * @param data - Data to convert to CSV
 * @param options - Export options
 * @returns CSV string
 */
export function convertToCsvString(
  data: Record<string, any>[] | any[][] | Record<string, any>,
  options: CsvExportOptions = {}
): string {
  // Default options
  const {
    headers = true,
    customHeaders,
    delimiter = ',',
    quote = '"',
    includeIndex = false,
    columns,
  } = options;

  // Handle single object case
  const dataArray = Array.isArray(data) ? data : [data];

  // If data is empty, return empty string or just headers
  if (dataArray.length === 0) {
    if (headers && customHeaders) {
      return customHeaders.join(delimiter);
    }
    return '';
  }

  let csvData: any[][];
  let headerRow: string[] | undefined;

  // Handle array of objects (most common case)
  if (typeof dataArray[0] === 'object' && !Array.isArray(dataArray[0])) {
    const records = dataArray as Record<string, any>[];

    // Determine columns to include
    const allColumns =
      columns ||
      Array.from(new Set(records.flatMap((record) => Object.keys(record))));

    // Create header row
    headerRow = customHeaders || allColumns;

    // Convert objects to arrays based on columns
    csvData = records.map((record, index) => {
      const row = allColumns.map((col) => {
        const value = record[col];
        return value === undefined || value === null ? '' : value;
      });

      // Add index column if requested
      if (includeIndex) {
        row.unshift(index);
      }

      return row;
    });

    // Add index header if needed
    if (includeIndex && headerRow) {
      headerRow.unshift('index');
    }
  } else {
    // Data is already in array format
    csvData = dataArray as any[][];

    if (customHeaders) {
      headerRow = customHeaders;
    }
  }

  // Create CSV string
  const csvOptions = {
    delimiter,
    quoted: true,
    quote,
    header: headers && headerRow ? true : false,
    columns: headerRow,
  };

  return (
    csvStringify(
      headers && headerRow
        ? [Object.fromEntries(headerRow.map((h, i) => [h, h]))]
        : [],
      csvOptions
    ) + csvStringify(csvData, { ...csvOptions, header: false })
  );
}

/**
 * Parse a CSV string to an array of objects
 *
 * @param csvString - CSV string to parse
 * @param options - Import options
 * @returns Array of objects parsed from the CSV string
 */
export function parseCsvString<T = Record<string, any>>(
  csvString: string,
  options: CsvImportOptions = {}
): T[] {
  // Default options
  const {
    headers = true,
    delimiter = ',',
    quote = '"',
    skipLines = 0,
    trim = true,
    parseNumbers = true,
    columnTransforms = {},
  } = options;

  // Parse CSV
  const parseOptions = {
    delimiter,
    quote,
    skip_empty_lines: true,
    trim,
    from_line: skipLines + 1,
    columns: headers,
    cast: parseNumbers
      ? (value: string, context: any) => {
          // Try to convert to number if it looks like one
          if (/^-?\d+(\.\d+)?$/.test(value)) {
            return Number(value);
          }
          return value;
        }
      : undefined,
  };

  // Parse the CSV content
  const records = csvParse(csvString, parseOptions) as T[];

  // Apply column transformations if any
  if (Object.keys(columnTransforms).length > 0) {
    return records.map((record) => {
      const transformed = { ...record };
      for (const [column, transform] of Object.entries(columnTransforms)) {
        if (column in transformed) {
          transformed[column] = transform(transformed[column]);
        }
      }
      return transformed;
    });
  }

  return records;
}
```

## Usage Examples

### Python Examples

#### Exporting Data

```python
import pandas as pd
from vnstock.common.csv import export_to_csv

# Export DataFrame
df = pd.DataFrame({
    'symbol': ['VNM', 'VIC', 'VHM'],
    'price': [89.2, 55.3, 60.1],
    'change': [0.5, -0.2, 1.1]
})
export_to_csv(df, 'stocks.csv')

# Export dictionary
data = {
    'symbol': 'VNM',
    'price': 89.2,
    'change': 0.5
}
export_to_csv(data, 'vnm.csv')

# Export list of dictionaries
data_list = [
    {'symbol': 'VNM', 'price': 89.2, 'change': 0.5},
    {'symbol': 'VIC', 'price': 55.3, 'change': -0.2},
    {'symbol': 'VHM', 'price': 60.1, 'change': 1.1}
]
export_to_csv(data_list, 'stocks_list.csv')

# Export with additional options
export_to_csv(df, 'stocks_formatted.csv',
              index=True,
              sep=';',  # Use semicolon as separator
              date_format='%Y-%m-%d',  # Format dates
              float_format='%.2f')  # Format floats
```

#### Importing Data

```python
from vnstock.common.csv import import_from_csv

# Basic import
df = import_from_csv('stocks.csv')

# Import with options
df = import_from_csv('stocks_formatted.csv',
                     sep=';',  # Match the separator used when exporting
                     parse_dates=['date'],  # Convert date columns to datetime
                     na_values=['N/A', 'none'],  # Custom NA values
                     dtype={'symbol': str, 'price': float})  # Type specifications
```

### TypeScript Examples

#### Exporting Data

```typescript
import { exportToCsv } from './csv';

// Export array of objects
const data = [
  { symbol: 'VNM', price: 89.2, change: 0.5 },
  { symbol: 'VIC', price: 55.3, change: -0.2 },
  { symbol: 'VHM', price: 60.1, change: 1.1 },
];

// Basic export
await exportToCsv(data, 'stocks.csv');

// Export with custom options
await exportToCsv(data, 'stocks_formatted.csv', {
  headers: true,
  customHeaders: ['Symbol', 'Price (VND)', 'Change (%)'],
  delimiter: ';',
  includeIndex: true,
  columns: ['symbol', 'price', 'change'], // Specify column order
});

// Export single object
const singleStock = { symbol: 'VNM', price: 89.2, change: 0.5 };
await exportToCsv(singleStock, 'vnm.csv');

// Export CSV string without writing to file
const csvString = convertToCsvString(data, {
  headers: true,
  delimiter: ',',
});
console.log(csvString);
```

#### Importing Data

```typescript
import { importFromCsv } from './csv';

// Define the expected data structure (optional but recommended for type safety)
interface StockData {
  symbol: string;
  price: number;
  change: number;
}

// Basic import
const stocks = await importFromCsv<StockData>('stocks.csv');

// Import with custom options
const formattedStocks = await importFromCsv<StockData>('stocks_formatted.csv', {
  headers: true,
  delimiter: ';',
  skipLines: 0,
  trim: true,
  parseNumbers: true,
  columnTransforms: {
    // Example: Convert symbol to uppercase
    symbol: (value: string) => value.toUpperCase(),
    // Example: Parse date string to Date object
    date: (value: string) => new Date(value),
  },
});

// Parse a CSV string
const csvString = `symbol,price,change
VNM,89.2,0.5
VIC,55.3,-0.2
VHM,60.1,1.1`;

const parsedData = parseCsvString<StockData>(csvString, {
  headers: true,
  parseNumbers: true,
});
```

## Implementation Details

### Node.js vs Browser Environment

The TypeScript implementation can be adapted for different environments:

1. **Node.js Environment**:

   - Uses the `fs` module for file operations
   - Can read and write directly to the file system

2. **Browser Environment**:
   - File operations use the File API
   - Export typically initiates a download in the browser
   - Import reads from a File object (e.g., from a file input)

This implementation can be modified to work in a browser environment by replacing the file system operations with browser-specific alternatives.

### Performance Considerations

For large CSV files, consider these performance optimizations:

1. **Streaming**: For very large files, use streaming APIs rather than loading the entire file into memory
2. **Worker Threads**: Process CSV data in a separate thread to avoid blocking the main thread
3. **Chunking**: Process large datasets in chunks to reduce memory usage

### Error Handling

The implementation includes basic error handling, but production code should consider:

1. **Detailed Error Messages**: Provide specific error messages for different failure scenarios
2. **Recovery Strategies**: Implement strategies to recover from partial failures
3. **Validation**: Validate data before writing to ensure CSV format integrity

## Dependencies

### Python Dependencies

- `pandas`: For CSV operations
- `os`: For file path operations

### TypeScript Dependencies

- `csv-parse`: For parsing CSV files
- `fs` and `path`: Node.js built-in modules for file operations

## Implementation Notes

1. The TypeScript implementation requires the `csv-parse` package, which provides efficient CSV parsing and stringification.

2. The Python implementation leverages pandas, which is already a dependency for most data operations in the vnstock package.

3. Both implementations handle:

   - Converting between in-memory data structures and CSV files
   - Customizing CSV format (delimiters, headers, etc.)
   - Error checking and reporting

4. The TypeScript implementation provides additional string handling functions that work with CSV data without file I/O operations.

5. For browser environments, modify the TypeScript implementation to use the File API instead of Node.js fs module.

6. The column transformation feature in the TypeScript implementation allows for powerful data manipulation during import.

7. Consider adding progress reporting for large file operations, especially in user-facing applications.
