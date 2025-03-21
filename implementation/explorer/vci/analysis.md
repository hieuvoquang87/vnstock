# Implementation of Analysis Module (VCI Explorer)

## Overview

The `analysis.py` module in the Python `vnstock` package is currently a placeholder file with minimal content (only containing a module docstring). However, analysis-related functionality is implemented in the `company.py` module through the `reports()` method of the `Company` class. This method retrieves analyst reports for a specific stock symbol.

In this implementation documentation, we'll focus on how to properly structure and implement the analysis functionality for the TypeScript version, potentially moving the relevant methods into a dedicated Analysis class.

## Current Implementation Status

### In Python Package

The `analysis.py` file in the Python package is almost empty:

```python
"""Analysis module."""
```

However, the `__init__.py` file imports and exposes everything from this module:

```python
from .analysis import *
```

The actual analysis functionality is implemented in the `Company` class in `company.py`:

```python
@optimize_execution("VCI")
def reports(self) -> pd.DataFrame:
    """
    Truy xuất báo cáo phân tích về công ty.

    Returns:
        pd.DataFrame: DataFrame chứa các báo cáo phân tích về công ty.
    """
    df = self._process_data(self.raw_data, 'AnalysisReportFiles')

    # Drop __typename column if it exists
    if '__typename' in df.columns:
        df = df.drop(columns=['__typename'])

    # Convert date from timestamp to date string if it's in timestamp format
    if 'date' in df.columns and df['date'].dtype in [int, float]:
        df['date'] = pd.to_datetime(df['date'], unit='ms').dt.strftime('%Y-%m-%d')

    return df
```

This method relies on data already fetched by the `Company` class constructor and processed by the `_process_data` helper method, which extracts the 'AnalysisReportFiles' from the GraphQL response.

## Proposed TypeScript Implementation

For the TypeScript implementation, we have two options:

1. Keep the current structure where analysis functionality stays within the Company class
2. Create a proper Analysis class that contains the analysis-related methods

For consistency and to align with the package structure, we'll implement option 2 in this documentation, moving the relevant functionality to a dedicated Analysis class.

### TypeScript Interface

```typescript
interface AnalysisOptions {
  symbol: string;
  randomAgent?: boolean;
  showLog?: boolean;
}
```

### TypeScript Class Implementation

```typescript
import axios from 'axios';
import { getHeaders } from '../../core/utils/client';
import { getLogger } from '../../core/utils/logger';

const logger = getLogger('vci.analysis');

/**
 * Class to access technical analysis data from VCI
 */
export class Analysis {
  private symbol: string;
  private headers: Record<string, string>;
  private showLog: boolean;

  /**
   * Create an Analysis instance for retrieving analyst reports
   */
  constructor(options: AnalysisOptions) {
    const { symbol, randomAgent = false, showLog = true } = options;

    this.symbol = symbol.toUpperCase();
    this.headers = getHeaders('VCI', randomAgent);
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel('error');
    }
  }

  /**
   * Retrieve analyst reports for a company
   */
  public async reports(lang: string = 'en'): Promise<any[]> {
    try {
      const url = 'https://api.vietcap.com.vn/data-mt/graphql';
      const payload = {
        query: `
          query Query($ticker: String!, $lang: String!) {
            AnalysisReportFiles(ticker: $ticker, langCode: $lang) {
              date
              description
              link
              name
              __typename
            }
          }
        `,
        variables: {
          ticker: this.symbol,
          lang: lang,
        },
      };

      if (this.showLog) {
        logger.info(`Fetching analyst reports for ${this.symbol}`);
      }

      const response = await axios.post(url, payload, {
        headers: this.headers,
      });

      if (
        !response.data ||
        !response.data.data ||
        !response.data.data.AnalysisReportFiles
      ) {
        return [];
      }

      // Process the data
      const reports = response.data.data.AnalysisReportFiles;

      // Transform the data
      const processedReports = reports.map((report: any) => {
        // Remove __typename field
        const { __typename, ...rest } = report;

        // Process date field if it's a timestamp
        if (rest.date && typeof rest.date === 'number') {
          const date = new Date(rest.date);
          rest.date = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }

        return rest;
      });

      return processedReports;
    } catch (error) {
      logger.error(`Error retrieving analyst reports: ${error.message}`);
      return [];
    }
  }

  /**
   * This method is a placeholder for future technical analysis functionality
   * that could be added to this class, such as moving averages, RSI, MACD, etc.
   */
  public async technicalIndicators(): Promise<void> {
    // This is a placeholder for future implementation
    throw new Error('Technical indicators not yet implemented');
  }
}
```

### Usage Example

```typescript
import { Analysis } from 'vnstock-ts';

async function getAnalystReports() {
  // Create an Analysis instance for a stock
  const analysis = new Analysis({
    symbol: 'VNM',
    showLog: true,
  });

  try {
    // Get analyst reports
    const reports = await analysis.reports();

    console.log('Analyst Reports:');
    reports.forEach((report) => {
      console.log(`${report.date}: ${report.name}`);
      console.log(`Description: ${report.description}`);
      console.log(`Link: ${report.link}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching analyst reports:', error);
  }
}

getAnalystReports();
```

## Implementation Details

### Data Flow

1. User creates an `Analysis` instance with a stock symbol
2. The `reports` method sends a GraphQL query to the VCI API
3. The response data is processed to:
   - Remove internal fields (`__typename`)
   - Format dates properly
4. The processed reports are returned as an array of objects

### API Endpoints

The module uses the following API endpoint:

- GraphQL API: `https://api.vietcap.com.vn/data-mt/graphql`

### Future Expansion

Currently, the analysis module only provides access to analyst reports. In the future, it could be expanded to include:

1. Technical indicators calculation (RSI, MACD, Bollinger Bands)
2. Chart pattern recognition
3. Trading signals based on technical analysis
4. Trend analysis
5. Statistical data analysis

These features would make the Analysis class more useful for algorithmic trading and decision support systems.

## Dependencies

### Required Packages

- `axios`: For making HTTP requests

### Internal Dependencies

- `getHeaders` (from `core/utils/client`): To get appropriate headers for API requests
- `getLogger` (from `core/utils/logger`): For logging functionality

## Implementation Notes

1. **Module Structure:**

   - Although the original Python code has analysis functionality in the Company class, it makes more sense to have a dedicated Analysis class for technical analysis and reports.
   - This promotes better code organization and separation of concerns.

2. **GraphQL Queries:**

   - The implementation uses GraphQL to retrieve data from the VCI API.
   - Consider implementing a common GraphQL client utility for reuse across modules.

3. **Error Handling:**

   - The reports method handles API errors gracefully by returning an empty array.
   - For a production implementation, consider more advanced error handling with retry logic.

4. **Module Expansion:**

   - Future versions should implement various technical analysis indicators.
   - Consider integrating with a technical analysis library like technicalindicators (npm package).

5. **Data Transformation:**
   - The implementation converts API responses to a more convenient structure for frontend use.
   - Date formatting is handled consistently across the module.

By implementing the Analysis class in this way, the TypeScript version will maintain compatibility with the Python package's behavior while providing room for future expansion of technical analysis capabilities.
