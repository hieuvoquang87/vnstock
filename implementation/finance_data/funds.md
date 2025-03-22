# Implementation of Funds Module

**Original Python Implementation**: [fund.py](/vnstock/explorer/fmarket/fund.py)


## Overview

The Funds Module provides comprehensive access to mutual fund data in the Vietnamese financial market. This module enables users to retrieve information about fund performance, holdings, asset allocations, and NAV history for investment and analysis purposes.

The module enables users to:

1. Access a comprehensive list of mutual funds available in the Vietnamese market
2. Filter funds by type (Balanced, Bond, Stock) or by specific criteria
3. Retrieve detailed fund information including performance metrics and NAV history
4. Analyze fund holdings by asset types, industries, and top securities
5. Track fund performance across different time periods (1M, 3M, 6M, 12M, etc.)
6. Compare multiple funds based on various performance metrics

## Component Structure

The Funds Module is primarily organized around the `Fund` class and its nested `FundDetails` class:

```
Fund
├── Listing & Filtering Methods
│   ├── listing() - Get list of all funds
│   └── filter() - Filter funds by criteria
│
├── Fund Analysis Methods
│   ├── top_holding() - Get top holdings in a fund
│   ├── industry_holding() - Get industry allocation
│   ├── asset_holding() - Get asset type allocation
│   └── nav_report() - Get NAV history and performance
│
└── FundDetails - Nested class for detailed fund information
    ├── top_holding() - Get top holdings by fund symbol
    ├── industry_holding() - Get industry allocation by fund symbol
    ├── asset_holding() - Get asset type allocation by fund symbol
    └── nav_report() - Get NAV history by fund symbol
```

## Python Implementation

### Fund Class

The `Fund` class is the main entry point for accessing mutual fund data:

```python
class Fund(BaseComponent):
    SUPPORTED_SOURCES = ["FMARKET"]

    def __init__(self, source: str = "FMARKET", random_agent: bool = False):
        super().__init__(source=source)
        self.random_agent = random_agent
        self.details = self.data_source.details

    def _load_data_source(self):
        module = importlib.import_module(self.source_module)
        return module.Fund(self.random_agent)
```

### FMARKET Fund Implementation

The implementation of the `Fund` class for the FMARKET data source:

```python
class Fund:
    def __init__(self, random_agent: bool = False) -> None:
        """
        Initialize an object to access data from Fmarket.
        """
        self.data_source = "fmarket"
        self.headers = get_headers(data_source=self.data_source, random_agent=random_agent)
        self.base_url = _BASE_URL
        self.fund_list = self.listing()['short_name'].to_list()
        self.details = self.FundDetails(self)

    @optimize_execution("fmarket")
    def listing(self, fund_type: str = "") -> pd.DataFrame:
        """
        Retrieve the list of all open-ended funds available on Fmarket through API. View directly at https://fmarket.vn

        Parameters:
        ----------
            fund_type (str): Type of fund to filter. Default is empty to get all funds. Valid fund types include: 'BALANCED', 'BOND', 'STOCK'

        Returns:
        -------
            pd.DataFrame: DataFrame containing information of all open-ended funds available on Fmarket.
        """
        fund_type = fund_type.upper()
        fundAssetTypes = _FUND_TYPE_MAPPING.get(fund_type, [])

        if fund_type not in {"", "BALANCED", "BOND", "STOCK"}:
            logger.warning(f"Unsupported fund type: '{fund_type}'. Please choose from: '' to get all funds or specify one of 'BALANCED', 'BOND', or 'STOCK'.")

        # API call
        payload = {
            "types": ["NEW_FUND", "TRADING_FUND"],
            "issuerIds": [],
            "sortOrder": "DESC",
            "sortField": "navTo6Months",
            "page": 1,
            "pageSize": 100,
            "isIpo": False,
            "fundAssetTypes": fundAssetTypes,
            "bondRemainPeriods": [],
            "searchField": "",
            "isBuyByReward": False,
            "thirdAppIds": [],
        }
        url = f"{_BASE_URL}/filter"

        # Make request and process response
        # ...

        return df

    @optimize_execution("fmarket")
    def filter(self, symbol: str = "") -> pd.DataFrame:
        """
        Retrieve the list of funds by short name (symbol) and fund id. Default is empty to list all funds.

        Parameters:
        ----------
            symbol (str): Short name of the fund to search for. Default is empty to get all funds.

        Returns:
        -------
            pd.DataFrame: DataFrame containing information of the searched fund.
        """
        symbol = symbol.upper()

        payload = {
            "searchField": symbol,
            "types": ["NEW_FUND", "TRADING_FUND"],
            "pageSize": 100,
        }
        url = f"{_BASE_URL}/filter"

        # Make request and process response
        # ...

        return df

    @optimize_execution("fmarket")
    def top_holding(self, fundId: int = 23) -> pd.DataFrame:
        """
        Retrieve list of top 10 holdings in the specified fund. Live data is retrieved from the Fmarket API.

        Parameters
        ----------
            fundId : int
                id of a fund in fmarket database
        Returns
        -------
            df : pd.DataFrame
                DataFrame of the current top 10 holdings of the selected fund.
        """
        url = f"{_BASE_URL}/{fundId}"

        # Make request and process response
        # ...

        return df

    @optimize_execution("fmarket")
    def industry_holding(self, fundId: int = 23) -> pd.DataFrame:
        """
        Retrieve industry allocation for specified fund. Live data is retrieved from the Fmarket API.

        Parameters
        ----------
            fundId : int
                id of a fund in fmarket database
        Returns
        -------
            df : pd.DataFrame
                DataFrame of industry allocation of the selected fund.
        """
        url = f"{_BASE_URL}/{fundId}"

        # Make request and process response
        # ...

        return df

    @optimize_execution("fmarket")
    def nav_report(self, fundId: int = 23) -> pd.DataFrame:
        """
        Retrieve NAV history for specified fund. Live data is retrieved from the Fmarket API.

        Parameters
        ----------
            fundId : int
                id of a fund in fmarket database
        Returns
        -------
            df : pd.DataFrame
                DataFrame of NAV history of the selected fund.
        """
        url = f"{_BASE_URL}/{fundId}/nav-report"

        # Make request and process response
        # ...

        return df

    @optimize_execution("fmarket")
    def asset_holding(self, fundId: int = 23) -> pd.DataFrame:
        """
        Retrieve list of assets holding allocation for specific fundID. Live data is retrieved from the Fmarket API.

        Parameters
        ----------
            fundId : int
                id of a fund in fmarket database.

        Returns
        -------
            df : pd.DataFrame
                DataFrame of assets holding allocation of the selected fund.
        """
        url = f"{_BASE_URL}/{fundId}"

        # Make request and process response
        # ...

        return df
```

### FundDetails Nested Class

The `FundDetails` nested class provides methods to access detailed information about specific funds using their symbols:

```python
class FundDetails:
    def __init__(self, parent):
        self.parent = parent

    @optimize_execution("fmarket")
    def top_holding(self, symbol="SSISCA") -> pd.DataFrame:
        return self._get_fund_details(symbol, 'top_holding')

    @optimize_execution("fmarket")
    def industry_holding(self, symbol="SSISCA") -> pd.DataFrame:
        return self._get_fund_details(symbol, 'industry_holding')

    @optimize_execution("fmarket")
    def nav_report(self, symbol="SSISCA") -> pd.DataFrame:
        return self._get_fund_details(symbol, 'nav_report')

    @optimize_execution("fmarket")
    def asset_holding(self, symbol="SSISCA") -> pd.DataFrame:
        return self._get_fund_details(symbol, 'asset_holding')

    def _get_fund_details(self, symbol, section) -> pd.DataFrame:
        """
        Internal method to retrieve fund details for a specific section.

        Parameters
        ----------
            symbol : str
                ticker of a fund. A.k.a fund short name
            section : str
                section of data to retrieve. Options: 'top_holding', 'industry_holding', 'nav_report', 'asset_holding'

        Returns
        -------
            df : pd.DataFrame
                DataFrame of the current top holdings of the selected fund.
        """
        # validate "symbol" param input
        symbol = symbol.upper()
        if symbol not in self.parent.fund_list:
            logger.error(f"Error: {symbol} is not a valid input. Call the listing() method for the list of valid Fund short_name.")
            raise ValueError(f"Invalid symbol: {symbol}")
        try:
            # Lookup a valid "fundID" related to "symbol"
            fundID = int(self.parent.filter(symbol)["id"][0])
            logger.info(f"Retrieving data for {symbol}")
        except Exception as e:
            logger.error(f"An unexpected error occurred: {str(e)}")
            raise

        # validate "section" param input and call appropriate method
        # ...

        return df
```

## TypeScript Implementation

### Fund Class

The TypeScript implementation of the `Fund` class:

```typescript
export class Fund extends BaseComponent {
  public static readonly SUPPORTED_SOURCES: string[] = ['FMARKET'];
  public details: FundDetails;

  constructor(
    source: string = 'FMARKET',
    options: { randomAgent?: boolean } = {}
  ) {
    super(null, source);

    // Initialize details property after dataSource is loaded
    this.details = new FundDetails(this);
  }

  protected loadDataSource(): any {
    try {
      if (this.source === 'FMARKET') {
        return new FmarketFundAdapter(this.options?.randomAgent || false);
      }

      throw new Error(`Unsupported data source: ${this.source}`);
    } catch (error) {
      this.logger.error(`Failed to load Fund data source: ${error}`);
      throw error;
    }
  }

  /**
   * Get a list of all funds
   *
   * @param options - Options for filtering funds
   * @returns Promise resolving to a list of funds
   */
  public async listing(options: { fundType?: string } = {}): Promise<any> {
    return await this.dataSource.listing(options);
  }

  /**
   * Filter funds by symbol
   *
   * @param options - Filter options
   * @returns Promise resolving to filtered funds list
   */
  public async filter(options: { symbol: string }): Promise<any> {
    return await this.dataSource.filter(options);
  }

  /**
   * Get top holdings for a fund
   *
   * @param options - Options specifying the fund ID
   * @returns Promise resolving to top holdings data
   */
  public async topHolding(options: { fundId: number }): Promise<any> {
    return await this.dataSource.topHolding(options);
  }

  /**
   * Get industry allocation for a fund
   *
   * @param options - Options specifying the fund ID
   * @returns Promise resolving to industry allocation data
   */
  public async industryHolding(options: { fundId: number }): Promise<any> {
    return await this.dataSource.industryHolding(options);
  }

  /**
   * Get NAV history for a fund
   *
   * @param options - Options specifying the fund ID
   * @returns Promise resolving to NAV history data
   */
  public async navReport(options: { fundId: number }): Promise<any> {
    return await this.dataSource.navReport(options);
  }

  /**
   * Get asset allocation for a fund
   *
   * @param options - Options specifying the fund ID
   * @returns Promise resolving to asset allocation data
   */
  public async assetHolding(options: { fundId: number }): Promise<any> {
    return await this.dataSource.assetHolding(options);
  }
}
```

### FundDetails Class

The TypeScript implementation of the `FundDetails` class:

```typescript
export class FundDetails {
  private parent: Fund;

  constructor(parent: Fund) {
    this.parent = parent;
  }

  /**
   * Get top holdings for a fund by symbol
   *
   * @param options - Options with the fund symbol
   * @returns Promise resolving to top holdings data
   */
  public async topHolding(options: { symbol: string }): Promise<any> {
    return await this.getFundDetails({
      symbol: options.symbol,
      section: 'topHolding',
    });
  }

  /**
   * Get industry allocation for a fund by symbol
   *
   * @param options - Options with the fund symbol
   * @returns Promise resolving to industry allocation data
   */
  public async industryHolding(options: { symbol: string }): Promise<any> {
    return await this.getFundDetails({
      symbol: options.symbol,
      section: 'industryHolding',
    });
  }

  /**
   * Get NAV history for a fund by symbol
   *
   * @param options - Options with the fund symbol
   * @returns Promise resolving to NAV history data
   */
  public async navReport(options: { symbol: string }): Promise<any> {
    return await this.getFundDetails({
      symbol: options.symbol,
      section: 'navReport',
    });
  }

  /**
   * Get asset allocation for a fund by symbol
   *
   * @param options - Options with the fund symbol
   * @returns Promise resolving to asset allocation data
   */
  public async assetHolding(options: { symbol: string }): Promise<any> {
    return await this.getFundDetails({
      symbol: options.symbol,
      section: 'assetHolding',
    });
  }

  /**
   * Internal method to get fund details by symbol and section
   */
  private async getFundDetails(options: {
    symbol: string;
    section: string;
  }): Promise<any> {
    const { symbol, section } = options;

    try {
      // Get fund ID from symbol
      const fundsList = await this.parent.listing();
      const fundInfo = fundsList.find(
        (fund: any) => fund.short_name?.toUpperCase() === symbol.toUpperCase()
      );

      if (!fundInfo) {
        throw new Error(
          `Fund with symbol ${symbol} not found. Use listing() to see available funds.`
        );
      }

      const fundId = fundInfo.fund_id_fmarket;

      // Call appropriate method based on section
      switch (section) {
        case 'topHolding':
          return await this.parent.topHolding({ fundId });
        case 'industryHolding':
          return await this.parent.industryHolding({ fundId });
        case 'navReport':
          return await this.parent.navReport({ fundId });
        case 'assetHolding':
          return await this.parent.assetHolding({ fundId });
        default:
          throw new Error(`Invalid section: ${section}`);
      }
    } catch (error) {
      console.error(`Error getting fund details: ${error}`);
      throw error;
    }
  }
}
```

## Usage Examples

### Python Examples

#### Listing All Funds

```python
from vnstock.common.vnstock import Vnstock

# Create a Vnstock instance and access fund components
vnstock = Vnstock()
fund = vnstock.fund()

# Get all funds
all_funds = fund.listing()
print(f"Total funds: {len(all_funds)}")

# Get only bond funds
bond_funds = fund.listing(fund_type="BOND")
print(f"Bond funds: {len(bond_funds)}")

# Get only balanced funds
balanced_funds = fund.listing(fund_type="BALANCED")
print(f"Balanced funds: {len(balanced_funds)}")

# Get only stock funds
stock_funds = fund.listing(fund_type="STOCK")
print(f"Stock funds: {len(stock_funds)}")
```

#### Getting Fund Details by Symbol

```python
from vnstock.common.vnstock import Vnstock

# Create a Vnstock instance and access fund components
vnstock = Vnstock()
fund = vnstock.fund()

# Get top holdings of a specific fund by symbol
top_holdings = fund.details.top_holding(symbol="SSISCA")
print(f"Top holdings of SSISCA fund: {len(top_holdings)} positions")

# Get industry allocation of a specific fund
industry_allocation = fund.details.industry_holding(symbol="SSISCA")
print(f"Industry allocation of SSISCA fund: {len(industry_allocation)} sectors")

# Get asset type allocation of a specific fund
asset_allocation = fund.details.asset_holding(symbol="SSISCA")
print(f"Asset allocation of SSISCA fund: {len(asset_allocation)} asset types")

# Get NAV history of a specific fund
nav_history = fund.details.nav_report(symbol="SSISCA")
print(f"NAV history of SSISCA fund: {len(nav_history)} data points")
```

#### Filtering Funds

```python
from vnstock.common.vnstock import Vnstock

# Create a Vnstock instance and access fund components
vnstock = Vnstock()
fund = vnstock.fund()

# Filter funds by symbol
ssi_funds = fund.filter(symbol="SSI")
print(f"SSI funds: {len(ssi_funds)}")

# Get fund ID from filter result to use with other methods
fund_id = ssi_funds['id'][0]

# Use fund_id directly with other methods
top_holdings = fund.top_holding(fundId=fund_id)
print(f"Top holdings: {len(top_holdings)} positions")
```

### TypeScript Examples

#### Listing All Funds

```typescript
import { Vnstock } from 'vnstock-ts';

async function listFunds() {
  // Create a Vnstock instance and access fund components
  const vnstock = new Vnstock();
  const fund = vnstock.fund();

  // Get all funds
  const allFunds = await fund.listing();
  console.log(`Total funds: ${allFunds.length}`);

  // Get only bond funds
  const bondFunds = await fund.listing({ fundType: 'BOND' });
  console.log(`Bond funds: ${bondFunds.length}`);

  // Get only balanced funds
  const balancedFunds = await fund.listing({ fundType: 'BALANCED' });
  console.log(`Balanced funds: ${balancedFunds.length}`);

  // Get only stock funds
  const stockFunds = await fund.listing({ fundType: 'STOCK' });
  console.log(`Stock funds: ${stockFunds.length}`);
}

listFunds();
```

#### Getting Fund Details by Symbol

```typescript
import { Vnstock } from 'vnstock-ts';

async function getFundDetails() {
  // Create a Vnstock instance and access fund components
  const vnstock = new Vnstock();
  const fund = vnstock.fund();

  // Get top holdings of a specific fund by symbol
  const topHoldings = await fund.details.topHolding({ symbol: 'SSISCA' });
  console.log(`Top holdings of SSISCA fund: ${topHoldings.length} positions`);

  // Get industry allocation of a specific fund
  const industryAllocation = await fund.details.industryHolding({
    symbol: 'SSISCA',
  });
  console.log(
    `Industry allocation of SSISCA fund: ${industryAllocation.length} sectors`
  );

  // Get asset type allocation of a specific fund
  const assetAllocation = await fund.details.assetHolding({
    symbol: 'SSISCA',
  });
  console.log(
    `Asset allocation of SSISCA fund: ${assetAllocation.length} asset types`
  );

  // Get NAV history of a specific fund
  const navHistory = await fund.details.navReport({ symbol: 'SSISCA' });
  console.log(`NAV history of SSISCA fund: ${navHistory.length} data points`);
}

getFundDetails();
```

#### Filtering Funds

```typescript
import { Vnstock } from 'vnstock-ts';

async function filterFunds() {
  // Create a Vnstock instance and access fund components
  const vnstock = new Vnstock();
  const fund = vnstock.fund();

  // Filter funds by symbol
  const ssiFunds = await fund.filter({ symbol: 'SSI' });
  console.log(`SSI funds: ${ssiFunds.length}`);

  // Get fund ID from filter result to use with other methods
  const fundId = ssiFunds[0].id;

  // Use fund_id directly with other methods
  const topHoldings = await fund.topHolding({ fundId });
  console.log(`Top holdings: ${topHoldings.length} positions`);
}

filterFunds();
```

## Implementation Details

### Data Flow

The Funds Module follows this general data flow:

1. User creates a `Vnstock` instance and accesses the fund component via `vnstock.fund()`
2. The `Fund` class is initialized with a specific data source (currently only FMARKET is supported)
3. When the user calls methods like `listing()` or `filter()`, the module makes API requests to the FMARKET API
4. The API responses are transformed into standardized DataFrame format in Python or array format in TypeScript
5. For detailed fund information, the `FundDetails` class provides a convenient interface to access data by fund symbol rather than internal fund ID

### Fund Data Structure

The Funds Module provides the following data structures:

1. **Fund Listing**: Basic information about each fund, including:

   - Short name (symbol) and full name
   - Fund type (bond, balanced, stock)
   - Fund manager/owner
   - Management fee
   - NAV and performance metrics

2. **Top Holdings**: Information about the fund's top securities positions:

   - Stock or bond name
   - Percentage of total fund assets
   - Industry/sector
   - Last update date

3. **Industry Allocation**: Breakdown of fund allocation by industries:

   - Industry/sector name
   - Percentage of total fund assets

4. **Asset Type Allocation**: Breakdown of fund allocation by asset types:

   - Asset type (cash, bonds, stocks, etc.)
   - Percentage of total fund assets

5. **NAV Report**: Historical net asset value of the fund:
   - NAV date
   - NAV value
   - Daily change
   - YTD change

### Data Sources

Currently, the Funds Module only supports the FMARKET data source, which provides comprehensive fund data for the Vietnamese market.

### Error Handling

Error handling in the Funds Module follows these principles:

1. **Input Validation**: Parameters are validated before making API calls
2. **Graceful Failure**: Failed API calls return informative error messages
3. **Logging**: Detailed logs provide context for debugging
4. **Consistent Error Reporting**: Errors follow the same format regardless of source

## Dependencies

### Python Dependencies

- `pandas`: For data manipulation and DataFrame operations
- `requests`: For HTTP requests to APIs
- Custom utilities:
  - `get_headers`: For generating appropriate API request headers
  - `send_request`: For making API requests with error handling
  - `convert_unix_to_datetime`: For converting timestamp data
  - `optimize_execution`: For optimizing API calls with caching

### TypeScript Dependencies

- `axios`: For HTTP requests
- `dayjs`: For date handling
- Custom utilities:
  - `ApiClient`: For making API requests with error handling
  - `convertUnixToDatetime`: For timestamp conversion
  - `optimizeExecution`: For optimizing API calls

## Implementation Notes

1. **Single Data Source**: The Funds Module currently only supports FMARKET as a data source, unlike other modules supporting multiple sources
2. **Nested API Structure**: The API uses both ID-based and symbol-based access through different class structures
3. **Convenient Aliases**: The `details` property provides symbol-based access which is more user-friendly
4. **Performance Optimization**: API calls are optimized with caching to reduce redundant requests
5. **Fund Type Filtering**: Supports filtering by fund type to retrieve only relevant funds
6. **Comprehensive Fund Information**: Provides full details about fund performance, holdings, and allocations
7. **Missing Data Handling**: Handles missing data gracefully as not all funds have the same information available
8. **Timestamp Conversions**: Automatically converts timestamp data to proper date objects
9. **Type Validation**: Validates fund types and other input parameters before making API calls
10. **Descriptive Error Messages**: Provides clear error messages for troubleshooting
