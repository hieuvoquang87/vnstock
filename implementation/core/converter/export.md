# Data Export Functionality

**Original Python Implementation**: [export.py](/vnstock/core/converter/export.py)


## Overview

The Data Export functionality in the Core Converter module provides mechanisms for exporting financial data from vnstock to various file formats, making it easy for users to analyze data in external tools or integrate with other systems. This component handles the conversion of in-memory data structures to standardized file formats.

## Supported Export Formats

The export functionality supports the following formats:

1. **CSV (Comma-Separated Values)**:

   - Simple text format for tabular data
   - Easily imported into spreadsheet applications
   - Suitable for data exchange between different systems

2. **Excel (XLSX)**:

   - Native Microsoft Excel format
   - Supports multiple worksheets, formatting, and formulas
   - Better visualization capabilities than CSV

3. **JSON (JavaScript Object Notation)**:

   - Hierarchical data format
   - Ideal for web applications and APIs
   - Preserves complex data structures

4. **HTML**:
   - Web-friendly tabular format
   - Can be embedded directly in web pages
   - Supports styling and formatting

## TypeScript Implementation

### Export Options

The export functionality is configured using the `ExportOptions` interface:

```typescript
/**
 * Options for controlling export behavior
 */
export interface ExportOptions {
  // General options
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;

  // CSV-specific options
  delimiter?: string;
  quoteStrings?: boolean;

  // Excel-specific options
  sheetName?: string;
  includeHeaderRow?: boolean;
  headerStyle?: ExcelCellStyle;

  // JSON-specific options
  pretty?: boolean;
  indentSize?: number;

  // HTML-specific options
  title?: string;
  tableClass?: string;
  includeCss?: boolean;
}

/**
 * Excel cell styling options
 */
export interface ExcelCellStyle {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  borderStyle?: 'thin' | 'medium' | 'thick' | 'none';
}
```

### Exporter Implementations

Each supported format has its own exporter implementation:

#### CSV Exporter

```typescript
export class CsvExporter implements DataExporter {
  /**
   * Export data to CSV format
   * @param data Data to export
   * @param options Export options
   * @returns Path to the exported file or the CSV string
   */
  async export(
    data: any[],
    options: Partial<ExportOptions> = {}
  ): Promise<string> {
    const delimiter = options.delimiter || ',';
    const includeHeaders = options.includeHeaders !== false;
    const quoteStrings = options.quoteStrings !== false;

    // Generate CSV content
    const csv = this.generateCsv(data, {
      delimiter,
      includeHeaders,
      quoteStrings,
    });

    // If filename is provided, save to file
    if (options.filename) {
      await this.saveToFile(csv, options.filename);
      return options.filename;
    }

    // Otherwise return the CSV content
    return csv;
  }

  /**
   * Generate CSV content from data
   */
  private generateCsv(data: any[], options: any): string {
    // Implementation details...
  }

  /**
   * Save CSV content to a file
   */
  private async saveToFile(content: string, filename: string): Promise<void> {
    // Implementation details...
  }
}
```

#### Excel Exporter

```typescript
export class ExcelExporter implements DataExporter {
  /**
   * Export data to Excel format
   * @param data Data to export
   * @param options Export options
   * @returns Path to the exported file
   */
  async export(
    data: any[],
    options: Partial<ExportOptions> = {}
  ): Promise<string> {
    if (!options.filename) {
      throw new Error('Filename is required for Excel export');
    }

    const sheetName = options.sheetName || 'Sheet1';
    const includeHeaders = options.includeHeaders !== false;

    // Create workbook and add worksheet
    const workbook = this.createWorkbook(data, {
      sheetName,
      includeHeaders,
      headerStyle: options.headerStyle,
    });

    // Save workbook to file
    await this.saveWorkbook(workbook, options.filename);
    return options.filename;
  }

  /**
   * Create Excel workbook from data
   */
  private createWorkbook(data: any[], options: any): any {
    // Implementation details...
  }

  /**
   * Save workbook to file
   */
  private async saveWorkbook(workbook: any, filename: string): Promise<void> {
    // Implementation details...
  }
}
```

### Exporter Factory

The `ExporterFactory` class creates the appropriate exporter based on the requested format:

```typescript
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
```

## Usage Examples

### Basic Export to File

```typescript
import { ExporterFactory, ExportFormat } from 'vnstock/core/converter';

async function exportPriceData(prices: PriceData[]): Promise<string> {
  // Create exporter for CSV format
  const exporter = ExporterFactory.createExporter(ExportFormat.CSV);

  // Export data to CSV file
  const filePath = await exporter.export(prices, {
    filename: 'price_data.csv',
    includeHeaders: true,
  });

  return filePath;
}
```

### Customized Excel Export

```typescript
import { ExporterFactory, ExportFormat } from 'vnstock/core/converter';

async function exportFinancialStatements(
  statements: FinancialStatement[]
): Promise<string> {
  // Create exporter for Excel format
  const exporter = ExporterFactory.createExporter(ExportFormat.EXCEL);

  // Export data to Excel file with customized options
  const filePath = await exporter.export(statements, {
    filename: 'financial_statements.xlsx',
    sheetName: 'Income Statement',
    includeHeaders: true,
    headerStyle: {
      bold: true,
      fontColor: '#ffffff',
      backgroundColor: '#2f5496',
    },
  });

  return filePath;
}
```

### Export to Multiple Formats

```typescript
import { ExporterFactory, ExportFormat } from 'vnstock/core/converter';

async function exportPortfolio(
  portfolio: PortfolioItem[],
  format: ExportFormat
): Promise<string> {
  // Create exporter for the requested format
  const exporter = ExporterFactory.createExporter(format);

  // Determine filename extension based on format
  const extensions = {
    [ExportFormat.CSV]: 'csv',
    [ExportFormat.EXCEL]: 'xlsx',
    [ExportFormat.JSON]: 'json',
    [ExportFormat.HTML]: 'html',
  };

  // Export data to the requested format
  const filePath = await exporter.export(portfolio, {
    filename: `portfolio.${extensions[format]}`,
    includeHeaders: true,
  });

  return filePath;
}
```

## Implementation Considerations

When implementing the export functionality, consider the following:

### Memory Usage

For large datasets, consider stream-based implementations to minimize memory usage:

```typescript
export class StreamingCsvExporter implements DataExporter {
  async export(
    data: any[],
    options: Partial<ExportOptions> = {}
  ): Promise<string> {
    // Create write stream
    const writeStream = fs.createWriteStream(options.filename!);

    // Write headers
    if (options.includeHeaders !== false) {
      const headers = Object.keys(data[0]).join(options.delimiter || ',');
      writeStream.write(headers + '\n');
    }

    // Write rows in batches
    const batchSize = 1000;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      // Process batch
      for (const row of batch) {
        const rowStr = this.formatRow(row, options.delimiter || ',');
        writeStream.write(rowStr + '\n');
      }
    }

    // Close stream
    await new Promise<void>((resolve, reject) => {
      writeStream.end((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return options.filename!;
  }

  private formatRow(row: any, delimiter: string): string {
    // Row formatting implementation
  }
}
```

### Browser Compatibility

For browser environments, provide download mechanisms instead of file saving:

```typescript
export class BrowserCsvExporter implements DataExporter {
  async export(
    data: any[],
    options: Partial<ExportOptions> = {}
  ): Promise<string> {
    // Generate CSV content
    const csv = this.generateCsv(data, options);

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create and click download link
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || 'export.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return url;
  }

  private generateCsv(data: any[], options: any): string {
    // CSV generation implementation
  }
}
```

### Cross-Platform Support

Ensure that the export functionality works across different platforms:

```typescript
export class PlatformAwareExporterFactory {
  static createExporter(format: ExportFormat): DataExporter {
    // Determine if running in browser or Node.js
    const isBrowser = typeof window !== 'undefined';

    switch (format) {
      case ExportFormat.CSV:
        return isBrowser ? new BrowserCsvExporter() : new NodeCsvExporter();
      case ExportFormat.EXCEL:
        return isBrowser ? new BrowserExcelExporter() : new NodeExcelExporter();
      // Additional formats...
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}
```

## Integration with Other Modules

The Export functionality integrates with other vnstock modules:

1. **Explorer Module**: Export data retrieved from data sources
2. **Analysis Module**: Export analysis results and visualizations
3. **Common Module**: Provide export capabilities for user interfaces

## Implementation Notes

When implementing or extending the export functionality:

1. **Error Handling**: Implement proper error handling for file system operations
2. **Validation**: Validate input data before export to prevent issues
3. **Formatting**: Ensure proper formatting of special data types (dates, numbers)
4. **Large Datasets**: Optimize for handling large datasets efficiently
5. **Encoding**: Ensure proper character encoding for international text

## References

For more information on data conversion and formatting, refer to:

- [Format Conversion Utilities](./format.md)
- [Data Normalization Functions](./normalize.md)
