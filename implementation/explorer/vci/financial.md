# Implementation of Financial Data Module (VCI Explorer)

## Overview

The `financial.py` module in the Python `vnstock` package provides functionality to retrieve and process financial data for Vietnamese stocks from the VCI data source. This includes financial reports (balance sheets, income statements, cash flows) and financial ratios. The module adapts to different company types (regular companies, banks, securities firms, insurance companies) and handles data transformation and localization.

## Classes and Methods

### `Finance` Class

The main class that provides access to financial data for a specific stock symbol.

#### Constructor

```python
def __init__(self, symbol: str, period: Optional[str] = 'quarter',
            get_all: Optional[bool] = True, show_log: Optional[bool] = True):
```

**Parameters:**

- `symbol`: Stock ticker symbol
- `period`: Reporting period, either 'quarter' or 'year'
- `get_all`: Whether to get all available data
- `show_log`: Whether to show log messages

#### Primary Public Methods

1. **`balance_sheet()`**: Retrieves balance sheet data

   ```python
   def balance_sheet(self, period: Optional[str] = None, lang: Optional[str] = 'en',
                    dropna: Optional[bool] = True, show_log: Optional[bool] = False) -> pd.DataFrame:
   ```

2. **`income_statement()`**: Retrieves income statement data

   ```python
   def income_statement(self, period: Optional[str] = None, lang: Optional[str] = 'en',
                       dropna: Optional[bool] = True, show_log: Optional[bool] = False) -> pd.DataFrame:
   ```

3. **`cash_flow()`**: Retrieves cash flow statement data

   ```python
   def cash_flow(self, period: Optional[str] = None, lang: Optional[str] = 'en',
                dropna: Optional[bool] = True, show_log: Optional[bool] = False) -> pd.DataFrame:
   ```

4. **`ratio()`**: Retrieves financial ratios
   ```python
   def ratio(self, period: Optional[str] = None, lang: Optional[str] = 'en',
           dropna: Optional[bool] = True, show_log: Optional[bool] = False,
           flatten_columns: Optional[bool] = False, separator: Optional[str] = "_",
           drop_levels: Optional[Union[int, List[int]]] = None) -> pd.DataFrame:
   ```

#### Private/Helper Methods

1. **`_get_company_type()`**: Determines the company type code based on industry classification
2. **`_get_report()`**: Retrieves raw financial report data from API
3. **`_get_ratio_dict()`**: Gets ratio dictionary/mapping for the company type
4. **`_process_report()`**: Processes and formats financial report data
5. **`_ratio_mapping()`**: Maps financial ratio data to appropriate columns based on company type

## Implementation Details

### Data Flow

1. User creates a `Finance` instance with a stock symbol
2. The class determines the company type from industry classification
3. When a report method is called, it:
   - Fetches raw data from the VCI API
   - Processes the data using appropriate mappings
   - Transforms data into a standardized DataFrame
   - Handles localization (Vietnamese/English)
   - Returns the formatted report

### API Endpoints

The module uses GraphQL queries to the VCI API to retrieve financial data:

```
https://wfbiapi.vci.com.vn/graphql
```

### Company Type Classification

The module classifies companies into four categories:

- `CT`: Regular companies (default)
- `NH`: Banks
- `CK`: Securities firms
- `BH`: Insurance companies

Each company type has different financial report structures.

### Data Transformations

- Financial data is transformed from raw API responses into hierarchical DataFrames
- Column headers are localized based on language preference
- Multi-level column indices are used to organize data by year/quarter and metric
- Various data cleaning operations are performed (handling NaNs, removing empty columns)

## TypeScript Implementation

### TypeScript Interface

```typescript
interface FinancialOptions {
  symbol: string;
  period?: 'quarter' | 'year';
  getAll?: boolean;
  showLog?: boolean;
}

interface ReportOptions {
  period?: 'quarter' | 'year';
  lang?: 'en' | 'vi';
  dropna?: boolean;
  showLog?: boolean;
  flattenColumns?: boolean;
  separator?: string;
  dropLevels?: number | number[];
}
```

### TypeScript Class Implementation

```typescript
import { getAssetType } from '../../core/utils/parser';
import { getHeaders } from '../../core/utils/client';
import { getLogger } from '../../core/utils/logger';
import { Company } from './company';
import { FINANCIAL_REPORT_PERIOD_MAP, ICB4_COMTYPE_CODE_MAP } from './const';
import axios from 'axios';

const logger = getLogger('vci.finance');

/**
 * Class to access financial data for Vietnamese stocks from VCI
 */
export class Finance {
  private symbol: string;
  private assetType: string;
  private headers: Record<string, string>;
  private showLog: boolean;
  private period: string;
  private getAll: boolean;
  private comTypeCode: string;

  /**
   * Create a Finance instance for retrieving financial data
   */
  constructor(options: FinancialOptions) {
    const {
      symbol,
      period = 'quarter',
      getAll = true,
      showLog = true,
    } = options;

    this.symbol = symbol.toUpperCase();
    this.assetType = getAssetType(this.symbol);
    this.headers = getHeaders('VCI');
    this.showLog = showLog;

    // Disable logging if showLog is false
    if (!showLog) {
      logger.setLevel('error');
    }

    // Validate period
    if (period !== 'year' && period !== 'quarter') {
      throw new Error("Invalid period. Only 'year' or 'quarter' is accepted.");
    }

    // Validate asset type
    if (this.assetType !== 'stock') {
      throw new Error(
        'Invalid symbol. Only stock symbols have financial information.'
      );
    }

    this.period = FINANCIAL_REPORT_PERIOD_MAP[period];
    this.getAll = getAll;
    this.comTypeCode = this.getCompanyType();
  }

  /**
   * Get the company type code based on industry classification
   */
  private async getCompanyType(): Promise<string> {
    try {
      const company = new Company({ symbol: this.symbol });
      const listingInfo = await company.fetchData();
      const icbName4 = listingInfo.CompanyListingInfo.icbName4;
      return ICB4_COMTYPE_CODE_MAP[icbName4] || 'CT'; // Default to CT if not found
    } catch (error) {
      logger.error(`Error getting company type: ${error.message}`);
      return 'CT'; // Default to CT (Company)
    }
  }

  /**
   * Get balance sheet data
   */
  public async balanceSheet(options: ReportOptions = {}): Promise<any> {
    return this.processReport('Balance Sheet', options);
  }

  /**
   * Get income statement data
   */
  public async incomeStatement(options: ReportOptions = {}): Promise<any> {
    return this.processReport('Income Statement', options);
  }

  /**
   * Get cash flow data
   */
  public async cashFlow(options: ReportOptions = {}): Promise<any> {
    return this.processReport('Cash Flow', options);
  }

  /**
   * Get financial ratios
   */
  public async ratio(options: ReportOptions = {}): Promise<any> {
    const {
      period,
      lang = 'en',
      dropna = true,
      showLog = false,
      flattenColumns = false,
      separator = '_',
      dropLevels = null,
    } = options;

    const effectivePeriod = period
      ? FINANCIAL_REPORT_PERIOD_MAP[period] || period
      : this.period;

    try {
      const report = await this.getReport(effectivePeriod, lang, showLog);
      let financialReport = report[1]; // The second element contains ratio data

      if (dropna) {
        // Handle empty values and drop columns with all zeros
        // Implementation details would depend on the data structure
      }

      // Handle flattening columns if requested
      if (flattenColumns) {
        // Implementation of column flattening
      }

      return financialReport;
    } catch (error) {
      logger.error(`Error retrieving financial ratios: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process and format a financial report
   */
  private async processReport(
    reportType: string,
    options: ReportOptions = {}
  ): Promise<any> {
    const { period, lang = 'en', dropna = true, showLog = false } = options;

    // Implementation details
    // This would fetch and process the specified report type

    return {}; // Placeholder for actual implementation
  }

  /**
   * Get raw report data from API
   */
  private async getReport(
    period: string,
    lang: string,
    showLog: boolean
  ): Promise<any[]> {
    // Implementation for API call to fetch report data
    return [null, {}]; // Placeholder
  }
}
```

### Usage Example

```typescript
import { Finance } from 'vnstock-ts';

async function getFinancialData() {
  // Create a Finance instance for a stock
  const finance = new Finance({
    symbol: 'VNM',
    period: 'quarter',
  });

  try {
    // Get balance sheet data
    const balanceSheet = await finance.balanceSheet({
      lang: 'en',
      dropna: true,
    });
    console.log('Balance Sheet:', balanceSheet);

    // Get income statement data
    const incomeStatement = await finance.incomeStatement({
      lang: 'en',
    });
    console.log('Income Statement:', incomeStatement);

    // Get financial ratios with flattened columns
    const ratios = await finance.ratio({
      lang: 'en',
      flattenColumns: true,
      separator: '_',
    });
    console.log('Financial Ratios:', ratios);
  } catch (error) {
    console.error('Error fetching financial data:', error);
  }
}

getFinancialData();
```

## Dependencies

### Required Packages

- `axios`: For making HTTP requests
- Data processing utilities (for handling DataFrames in TypeScript)

### Internal Dependencies

- `getAssetType` (from `core/utils/parser`): To determine asset type from symbol
- `getHeaders` (from `core/utils/client`): To get appropriate headers for API requests
- `getLogger` (from `core/utils/logger`): For logging functionality
- `Company` class (from `./company`): To retrieve company information
- Constants from `./const`: For mapping values and report types

## Implementation Notes

1. **TypeScript vs Python DataFrame Handling**:

   - Python uses pandas for DataFrame operations
   - In TypeScript, consider using libraries like:
     - `danfojs`: Similar API to pandas
     - `data-forge`: JavaScript data processing library
     - Custom implementation with array operations

2. **GraphQL API Queries**:

   - The original Python code uses GraphQL queries to retrieve data
   - In TypeScript, implement proper GraphQL query construction

3. **Async Operations**:

   - Replace Python's synchronous requests with JavaScript's async/await pattern
   - Implement proper error handling with try/catch blocks

4. **Data Type Support**:

   - TypeScript doesn't have built-in support for hierarchical data structures like pandas
   - Consider implementing custom data types or adapting existing libraries

5. **Localization**:

   - Maintain support for both English and Vietnamese languages
   - Store localization mappings as constants

6. **Company Type Adaptability**:
   - Implement the logic to adapt financial data based on company type
   - Maintain separate mappings for different company types

By following this implementation guide, you should be able to recreate the functionality of the VCI Financial module in TypeScript.
