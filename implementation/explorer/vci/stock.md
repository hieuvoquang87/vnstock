# Implementation of Stock Data Module

**Original Python Implementation**: [stock.py](/vnstock/explorer/vci/stock.py)


## Overview

The Stock Data Module provides comprehensive access to stock market data, financial information, and trading functionality. While not implemented as a separate module in the current codebase, stock data functionality is distributed across several components including the `StockComponents` class, which serves as a facade for accessing various stock-related features.

This module enables users to:

1. Access historical and real-time stock price data
2. Retrieve company information and financial statements
3. Analyze price patterns and technical indicators
4. Screen stocks based on financial metrics
5. Track stock market indices and sectors

## Component Structure

The stock data functionality is organized into a hierarchical structure of components, with the `StockComponents` class serving as the main entry point. Each subcomponent provides specialized functionality for different aspects of stock data:

```
StockComponents
├── Quote - Historical and real-time price data
├── Company - Company profile and information
├── Finance - Financial statements and ratios
├── Trading - Trading data and market activity
├── Listing - Stock listings and market symbols
└── Screener - Stock screening and filtering
```

## Python Implementation

### StockComponents

The `StockComponents` class integrates various stock data components, configuring them based on the asset type and data source:

```python
class StockComponents(BaseComponent):
    SUPPORTED_SOURCES = ["VCI", "TCBS", "MSN"]

    def __init__(self, symbol: str, source: str = Config.DEFAULT_SOURCE, show_log: bool = True):
        super().__init__(symbol, source)
        self.show_log = show_log
        self.asset_type = get_asset_type(self.symbol)
        if not show_log:
            logger.setLevel(logging.CRITICAL)
        self._initialize_components()

    def _initialize_components(self):
        if self.asset_type == "stock":
            self.company = Company(self.symbol, source=self.source)
            self.finance = Finance(self.symbol, source=self.source)
        else:
            self.company = None
            self.finance = None
            logger.info("Not a stock symbol, company and finance information not available.")

        if self.source in ['VCI', 'TCBS']:
            self.listing = Listing(source='VCI')
            self.screener = Screener(source='TCBS')
            self.quote = Quote(self.symbol, self.source)
            self.trading = Trading(self.symbol, source=self.source)
        elif self.source == 'MSN':
            self.quote = Quote(self.symbol, 'MSN')
            self.listing = Listing(source='MSN')

    def update_symbol(self, symbol: str):
        self.symbol = symbol.upper()
        self._initialize_components()
```

### Quote Component

The Quote component manages historical price data, intraday data, and order book information:

```python
class Quote(BaseComponent):
    SUPPORTED_SOURCES = ["VCI", "TCBS", "MSN"]

    def __init__(self, symbol: str, source: str = Config.DEFAULT_SOURCE):
        super().__init__(symbol, source)

    def _load_data_source(self):
        module = importlib.import_module(self.source_module)
        return module.Quote(self.symbol.lower() if self.source == "MSN" else self.symbol)

    def _update_data_source(self, symbol: Optional[str] = None):
        if symbol:
            self.symbol = symbol.upper()
            self.data_source = self._load_data_source()

    @retry(stop=stop_after_attempt(Config.DEFAULT_RETRIES), wait=wait_exponential(multiplier=1, min=2, max=10))
    def history(self, symbol: Optional[str] = None, **kwargs):
        self._update_data_source(symbol)
        return self.data_source.history(**kwargs)

    @retry(stop=stop_after_attempt(Config.DEFAULT_RETRIES), wait=wait_exponential(multiplier=1, min=2, max=10))
    def intraday(self, symbol: Optional[str] = None, **kwargs):
        self._update_data_source(symbol)
        return self.data_source.intraday(**kwargs)

    @retry(stop=stop_after_attempt(Config.DEFAULT_RETRIES), wait=wait_exponential(multiplier=1, min=2, max=10))
    def price_depth(self, symbol: Optional[str] = None, **kwargs):
        self._update_data_source(symbol)
        return self.data_source.price_depth(**kwargs)
```

### Company Component

The Company component provides access to company information, profiles, shareholders, news, and dividend data:

```python
class Company(BaseComponent):
    SUPPORTED_SOURCES = ["TCBS", "VCI"]

    def __init__(self, symbol: Optional[str] = 'ACB', source: str = "TCBS"):
        super().__init__(symbol, source)

    def _load_data_source(self):
        module = importlib.import_module(self.source_module)
        return module.Company(self.symbol)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def overview(self, **kwargs):
        return self.data_source.overview(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def profile(self, **kwargs):
        return self.data_source.profile(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def shareholders(self, **kwargs):
        return self.data_source.shareholders(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def insider_deals(self, **kwargs):
        return self.data_source.insider_deals(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def subsidiaries(self, **kwargs):
        return self.data_source.subsidiaries(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def officers(self, **kwargs):
        return self.data_source.officers(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def events(self, **kwargs):
        return self.data_source.events(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def news(self, **kwargs):
        return self.data_source.news(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def dividends(self, **kwargs):
        return self.data_source.dividends(**kwargs)
```

### Finance Component

The Finance component handles financial statements and ratios for stock analysis:

```python
class Finance(BaseComponent):
    SUPPORTED_SOURCES = ["TCBS", "VCI"]
    SUPPORTED_PERIODS = ["quarter", "annual"]

    def __init__(
        self,
        symbol: str,
        period: str = 'quarter',
        source: str = 'TCBS',
        get_all: bool = True
    ):
        super().__init__(symbol, source)
        self.period = period.lower()
        if self.period not in self.SUPPORTED_PERIODS:
            raise ValueError(f"Period must be one of {', '.join(self.SUPPORTED_PERIODS)}")
        self.get_all = get_all

    def _load_data_source(self):
        module = importlib.import_module(self.source_module)
        return module.Finance(self.symbol)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def balance_sheet(self, symbol: Optional[str] = None, **kwargs) -> Any:
        return self._get_financial_data('balance_sheet', symbol, **kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def income_statement(self, symbol: Optional[str] = None, **kwargs) -> Any:
        return self._get_financial_data('income_statement', symbol, **kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def cash_flow(self, symbol: Optional[str] = None, **kwargs) -> Any:
        return self._get_financial_data('cash_flow', symbol, **kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def ratio(self, symbol: Optional[str] = None, **kwargs) -> Any:
        return self._get_financial_data('ratio', symbol, **kwargs)

    def _get_financial_data(self, report_type: str, symbol: Optional[str] = None, **kwargs) -> Any:
        self._update_data_source(symbol)
        method = getattr(self.data_source, report_type)
        kwargs.setdefault('period', self.period)
        kwargs.setdefault('get_all', self.get_all)
        return method(**kwargs)
```

### Trading Component

The Trading component provides access to market data and trading activity:

```python
class Trading(BaseComponent):
    SUPPORTED_SOURCES = ["VCI", "TCBS"]

    def __init__(self, symbol: Optional[str] = 'VN30F1M', source: str = Config.DEFAULT_SOURCE):
        super().__init__(symbol, source)

    def _load_data_source(self):
        module = importlib.import_module(self.source_module)
        return module.Trading(self.symbol)

    def _update_data_source(self, symbol: Optional[str] = None):
        if symbol:
            self.symbol = symbol.upper()
        self.data_source = self._load_data_source()

    @retry(stop=stop_after_attempt(Config.DEFAULT_RETRIES), wait=wait_exponential(multiplier=1, min=2, max=10))
    def price_board(self, symbols_list: list, **kwargs):
        return self.data_source.price_board(symbols_list, **kwargs)
```

## TypeScript Implementation

### StockComponents

```typescript
export class StockComponents extends BaseComponent {
  static readonly SUPPORTED_SOURCES = ['VCI', 'TCBS', 'MSN'];

  readonly quote: Quote;
  readonly listing: Listing;
  readonly trading?: Trading;
  readonly company?: Company;
  readonly finance?: Finance;
  readonly screener?: Screener;
  readonly assetType: AssetType;

  constructor(options: ComponentOptions) {
    super(options);

    if (!this.symbol) {
      throw new Error('Symbol is required for StockComponents');
    }

    this.assetType = getAssetType(this.symbol);
    this.initializeComponents();
  }

  /**
   * Initialize component properties based on asset type and source
   */
  private initializeComponents(): void {
    // Initialize based on asset type
    if (this.assetType === AssetType.Stock) {
      this.company = new Company({
        symbol: this.symbol,
        source: this.source,
      });

      this.finance = new Finance({
        symbol: this.symbol,
        source: this.source,
      });
    }

    // Initialize based on source
    if (['VCI', 'TCBS'].includes(this.source)) {
      this.listing = new Listing({ source: 'VCI' });
      this.screener = new Screener({ source: 'TCBS' });
      this.quote = new Quote({
        symbol: this.symbol,
        source: this.source,
      });
      this.trading = new Trading({
        symbol: this.symbol,
        source: this.source,
      });
    } else if (this.source === 'MSN') {
      this.quote = new Quote({
        symbol: this.symbol,
        source: 'MSN',
      });
      this.listing = new Listing({ source: 'MSN' });
    }
  }

  /**
   * Update the symbol for all child components
   */
  updateSymbol(symbol: string): void {
    this.symbol = symbol.toUpperCase();
    this.initializeComponents();
  }
}
```

### Quote Component

```typescript
export class Quote extends BaseComponent {
  static readonly SUPPORTED_SOURCES = ['VCI', 'TCBS', 'MSN'];

  constructor(options: ComponentOptions) {
    super(options);
  }

  /**
   * Load and configure the appropriate data source
   */
  protected loadDataSource(): any {
    try {
      const module = this.loadSourceModule();
      return new module.Quote({
        symbol:
          this.source === 'MSN' ? this.symbol?.toLowerCase() : this.symbol,
        showLog: this.showLog,
      });
    } catch (error) {
      logger.error(`Failed to load Quote data source: ${error}`);
      throw error;
    }
  }

  /**
   * Get historical price data for a symbol
   *
   * @param options - Options for retrieving historical data
   * @returns Promise resolving to historical price data
   */
  public async history(options: HistoryOptions = {}): Promise<any> {
    const { symbol, ...rest } = options;

    if (symbol) {
      this.updateSymbol(symbol);
    }

    try {
      return await this.dataSource.history(rest);
    } catch (error) {
      logger.error(`Error fetching history data: ${error}`);
      throw error;
    }
  }

  /**
   * Get intraday price data for a symbol
   *
   * @param options - Options for retrieving intraday data
   * @returns Promise resolving to intraday price data
   */
  public async intraday(options: IntradayOptions = {}): Promise<any> {
    const { symbol, ...rest } = options;

    if (symbol) {
      this.updateSymbol(symbol);
    }

    try {
      return await this.dataSource.intraday(rest);
    } catch (error) {
      logger.error(`Error fetching intraday data: ${error}`);
      throw error;
    }
  }

  /**
   * Get price depth (order book) data for a symbol
   *
   * @param options - Options for retrieving price depth data
   * @returns Promise resolving to price depth data
   */
  public async priceDepth(options: PriceDepthOptions = {}): Promise<any> {
    const { symbol, ...rest } = options;

    if (symbol) {
      this.updateSymbol(symbol);
    }

    try {
      return await this.dataSource.priceDepth(rest);
    } catch (error) {
      logger.error(`Error fetching price depth data: ${error}`);
      throw error;
    }
  }
}
```

## Usage Examples

### Python Examples

#### Initializing Stock Data Components

```python
from vnstock.common.vnstock import Vnstock

# Create a Vnstock instance and access stock components
vnstock = Vnstock(symbol="VNM", source="VCI")
stock_components = vnstock.stock()

# Directly create StockComponents
from vnstock.common.data.data_explorer import StockComponents
stock = StockComponents(symbol="VNM", source="TCBS")
```

#### Historical Price Data

```python
from vnstock.common.vnstock import Vnstock

# Get historical daily price data
vnstock = Vnstock()
stock = vnstock.stock(symbol="VNM")
historical_data = stock.quote.history(
    start="2023-01-01",
    end="2023-12-31",
    interval="1D"
)

# Get intraday data
intraday_data = stock.quote.intraday(
    interval="1H",
    page_size=100
)
```

#### Company Information

```python
from vnstock.common.vnstock import Vnstock

# Get company overview
vnstock = Vnstock()
stock = vnstock.stock(symbol="VNM")
company_overview = stock.company.overview()

# Get company profile
company_profile = stock.company.profile()

# Get major shareholders
shareholders = stock.company.shareholders()

# Get recent dividends
dividends = stock.company.dividends()
```

#### Financial Statements

```python
from vnstock.common.vnstock import Vnstock

# Get financial statements
vnstock = Vnstock()
stock = vnstock.stock(symbol="VNM")

# Income statement (quarterly)
income_statement = stock.finance.income_statement(period="quarter")

# Balance sheet (annual)
balance_sheet = stock.finance.balance_sheet(period="annual")

# Cash flow statement
cash_flow = stock.finance.cash_flow()

# Financial ratios
ratios = stock.finance.ratio()
```

#### Stock Screener

```python
from vnstock.common.vnstock import Vnstock

# Screen for stocks meeting criteria
vnstock = Vnstock()
stock = vnstock.stock(symbol="VNM")  # symbol only needed to initialize

# Screen for high dividend stocks
dividend_stocks = stock.screener.screen(
    criteria=[
        {"field": "dividend_yield", "operation": ">=", "value": 5},
        {"field": "market_cap", "operation": ">=", "value": 1000}
    ],
    size=20
)
```

### TypeScript Examples

#### Initializing Stock Data Components

```typescript
import { Vnstock } from 'vnstock-ts';

// Create a Vnstock instance and access stock components
const vnstock = new Vnstock({ symbol: 'VNM', source: 'VCI' });
const stockComponents = vnstock.stock();

// Directly create StockComponents
import { StockComponents } from 'vnstock-ts/data';
const stock = new StockComponents({
  symbol: 'VNM',
  source: 'TCBS',
});
```

#### Historical Price Data

```typescript
import { Vnstock } from 'vnstock-ts';

// Get historical daily price data
async function getHistoricalData() {
  const vnstock = new Vnstock();
  const stock = vnstock.stock({ symbol: 'VNM' });

  const historicalData = await stock.quote.history({
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1D',
  });

  console.log(historicalData);

  // Get intraday data
  const intradayData = await stock.quote.intraday({
    interval: '1H',
    pageSize: 100,
  });

  console.log(intradayData);
}

getHistoricalData();
```

#### Company Information

```typescript
import { Vnstock } from 'vnstock-ts';

async function getCompanyInfo() {
  const vnstock = new Vnstock();
  const stock = vnstock.stock({ symbol: 'VNM' });

  // Get company overview
  const companyOverview = await stock.company.overview();

  // Get company profile
  const companyProfile = await stock.company.profile();

  // Get major shareholders
  const shareholders = await stock.company.shareholders();

  // Get recent dividends
  const dividends = await stock.company.dividends();

  console.log({
    overview: companyOverview,
    profile: companyProfile,
    shareholders: shareholders,
    dividends: dividends,
  });
}

getCompanyInfo();
```

#### Financial Statements

```typescript
import { Vnstock } from 'vnstock-ts';

async function getFinancialData() {
  const vnstock = new Vnstock();
  const stock = vnstock.stock({ symbol: 'VNM' });

  // Income statement (quarterly)
  const incomeStatement = await stock.finance.incomeStatement({
    period: 'quarter',
  });

  // Balance sheet (annual)
  const balanceSheet = await stock.finance.balanceSheet({
    period: 'annual',
  });

  // Cash flow statement
  const cashFlow = await stock.finance.cashFlow();

  // Financial ratios
  const ratios = await stock.finance.ratio();

  console.log({
    incomeStatement,
    balanceSheet,
    cashFlow,
    ratios,
  });
}

getFinancialData();
```

## Implementation Details

### Data Flow

The Stock Data Module follows this general data flow:

1. User creates a `Vnstock` instance or directly instantiates `StockComponents`
2. `StockComponents` initializes appropriate subcomponents based on asset type and data source
3. When method calls are made to subcomponents, they:
   - Validate input parameters
   - Load the appropriate data source implementation
   - Make API requests to retrieve data
   - Transform responses into standardized formats
   - Return processed data to the user

### Data Sources

The module supports multiple data sources for stock information:

1. **VCI** (Vietstock): Vietnamese stock market data provider
2. **TCBS** (Techcombank Securities): Another Vietnamese securities firm with rich API
3. **MSN** (MSN Finance): Used primarily for international markets and indices

Each data source has its own implementation in the corresponding explorer module.

### Caching Strategy

The module uses several caching strategies:

1. **Memoization**: Methods in the Company and Finance components use `lru_cache` to cache results
2. **Symbol Validation**: Asset type determination and symbol validation results are cached
3. **API Response Caching**: Responses from frequently used API endpoints are cached

### Error Handling

Error handling follows these principles:

1. **Retry Logic**: Network operations use exponential backoff retry
2. **Validation First**: Parameters are validated before making API calls
3. **Graceful Degradation**: Components attempt to return partial data when possible
4. **Detailed Logging**: Errors include context about the operation and parameters

## Dependencies

### Python Dependencies

- `pandas`: For data manipulation and DataFrame operations
- `requests`: For HTTP requests to APIs
- `functools.lru_cache`: For caching results
- `tenacity`: For implementing retry logic

### TypeScript Dependencies

- `axios`: For HTTP requests
- `dayjs`: For date manipulation
- Custom utility functions:
  - `getAssetType`: For determining asset type from symbol
  - `getHeaders`: For generating appropriate API request headers
  - `sendRequest`: For making API requests with error handling

## Implementation Notes

1. **Modularity**: Components are designed to be used independently or as part of `StockComponents`
2. **Data Consistency**: All components return data in consistent formats (pandas DataFrames in Python)
3. **Symbol Handling**: Symbols are automatically converted to uppercase and validated
4. **Source Flexibility**: The architecture allows easy switching between data sources
5. **Error Resilience**: Components include retry logic and graceful error handling
6. **Caching**: Frequently used or expensive operations are cached to improve performance
7. **Type Safety**: TypeScript implementation uses strong typing for parameters and return values
8. **Logging**: Comprehensive logging helps with debugging and understanding API usage
9. **Extensibility**: The module can be extended with additional data sources by following the component interface pattern
10. **Pagination**: APIs that return large datasets support pagination for efficient data retrieval
