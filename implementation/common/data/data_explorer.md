# Implementation of API Module (Data Modules)

**Original Python Implementation**: [data_explorer.py](/vnstock/common/data/data_explorer.py)


## Overview

The `data_explorer.py` module in the Python `vnstock` package provides a comprehensive API interface for accessing financial market data from various sources. It implements a component-based architecture where each component (Quote, Listing, Trading, etc.) serves as a facade to the underlying data source implementations. This design allows for easy switching between data sources while maintaining a consistent API. The module also implements caching, retries, and error handling to improve performance and reliability.

## Classes and Components

### 1. `Config`

A centralized configuration class for managing global settings across all data components.

#### Python Implementation

```python
class Config:
    DEFAULT_SOURCE = "VCI"
    DEFAULT_TIMEOUT = 30  # seconds
    DEFAULT_RETRIES = 3
    CACHE_SIZE = 128
    LOG_LEVEL = logging.INFO

    @classmethod
    def setup(cls, **kwargs):
        for key, value in kwargs.items():
            if hasattr(cls, key):
                setattr(cls, key, value)
                logger.info(f"Updated config: {key}={value}")
```

### 2. `BaseComponent`

An abstract base class defining the interface for all data components, including source validation and loading.

#### Python Implementation

```python
class BaseComponent:
    SUPPORTED_SOURCES = []

    def __init__(self, symbol: Optional[str] = None, source: str = Config.DEFAULT_SOURCE):
        self.symbol = symbol.upper() if symbol else None
        self.source = source.upper()
        self._validate_source()
        self.source_module = f"vnstock.explorer.{self.source.lower()}"
        self.data_source = self._load_data_source()

    def _validate_source(self) -> None:
        if self.source not in self.SUPPORTED_SOURCES:
            raise ValueError(f"Chỉ có nguồn dữ liệu từ {', '.join(self.SUPPORTED_SOURCES)} được hỗ trợ.")

    def _load_data_source(self):
        raise NotImplementedError("Phương thức này phải được triển khai bởi các lớp con")
```

### 3. `StockComponents`

A high-level facade that composes multiple data components (Quote, Listing, Trading, etc.) for a specific stock symbol.

#### Python Implementation

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
            logger.info("Không phải là mã chứng khoán, thông tin công ty và tài chính không khả dụng.")

        if self.source in ['VCI', 'TCBS']:
            self.listing = Listing(source='VCI')
            self.screener = Screener(source='TCBS')
            self.quote = Quote(self.symbol, self.source)
            self.trading = Trading(self.symbol, source=self.source)

            if self.source == 'TCBS':
                logger.info("TCBS không cung cấp thông tin danh sách. Dữ liệu tự động trả về từ VCI.")
            elif self.source == 'VCI':
                logger.info("VCI không hỗ trợ kiểm tra cổ phiếu. Dữ liệu tự động trả về từ TCBS.")
        elif self.source == 'MSN':
            self.quote = Quote(self.symbol, 'MSN')
            self.listing = Listing(source='MSN')

    def update_symbol(self, symbol: str):
        self.symbol = symbol.upper()
        self._initialize_components()
```

### 4. `Quote`

A component for retrieving historical and real-time quote data for a symbol.

#### Python Implementation

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
        if self.source == "MSN":
            symbol_map = {**_CURRENCY_ID_MAP, **_GLOBAL_INDICES, **_CRYPTO_ID_MAP}
            if symbol:
                self.symbol = symbol_map[symbol]
                logger.info(f"Chuyển đổi {symbol} thành tên mã MSN: {self.symbol}")
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

### 5. `Listing`

A component for retrieving information about listed instruments (stocks, indices, etc.).

#### Python Implementation

```python
class Listing(BaseComponent):
    SUPPORTED_SOURCES = ["VCI", "MSN"]

    def __init__(self, source: str = Config.DEFAULT_SOURCE):
        super().__init__(source=source)

    def _load_data_source(self):
        module = importlib.import_module(self.source_module)
        return module.Listing()

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def all_symbols(self, **kwargs):
        return self.data_source.all_symbols(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def symbols_by_industries(self, **kwargs):
        return self.data_source.symbols_by_industries(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def symbols_by_exchange(self, **kwargs):
        return self.data_source.symbols_by_exchange(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def symbols_by_group(self, group='VN30', **kwargs):
        return self.data_source.symbols_by_group(group=group, **kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def industries_icb(self, **kwargs):
        return self.data_source.industries_icb(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def all_future_indices(self, **kwargs):
        return self.data_source.all_future_indices(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def all_covered_warrant(self, **kwargs):
        return self.data_source.all_covered_warrant(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def all_bonds(self, **kwargs):
        return self.data_source.all_bonds(**kwargs)

    @lru_cache(maxsize=Config.CACHE_SIZE)
    def all_government_bonds(self, **kwargs):
        return self.data_source.all_government_bonds(**kwargs)
```

### 6. `Trading`

A component for accessing real-time trading data.

#### Python Implementation

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

### 7. `Company`

A component for retrieving company information, news, events, etc.

#### Python Implementation

```python
class Company(BaseComponent):
    SUPPORTED_SOURCES = ["TCBS", "VCI"]

    def __init__(self, symbol: Optional[str] = 'ACB', source: str = "TCBS"):
        super().__init__(symbol, source)

    def _load_data_source(self):
        module = importlib.import_module(self.source_module)
        return module.Company(self.symbol)

    def _update_data_source(self, symbol: Optional[str] = None):
        if symbol:
            self.symbol = symbol.upper()
            self.data_source = self._load_data_source()

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

### 8. `Finance`

A component for retrieving financial statements and ratios.

#### Python Implementation

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

    def _update_data_source(self, symbol: Optional[str] = None):
        if symbol:
            self.symbol = symbol.upper()
            try:
                self.data_source = self._load_data_source()
            except (ImportError, AttributeError) as e:
                logger.error(f"Cannot update data source: {e}")
                raise

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
```

### 9. `Screener`

A component for performing stock screener operations.

#### Python Implementation

```python
class Screener(BaseComponent):
    SUPPORTED_SOURCES = ["TCBS"]

    def __init__(self, source: str = "TCBS"):
        super().__init__(source=source)

    def _load_data_source(self):
        module = importlib.import_module(self.source_module)
        return module.Screener()

    @retry(stop=stop_after_attempt(Config.DEFAULT_RETRIES), wait=wait_exponential(multiplier=1, min=2, max=10))
    def stock(self, **kwargs):
        allowed_kwargs = ['params', 'limit', 'lang']
        processed_kwargs = {k: v for k, v in kwargs.items() if k in allowed_kwargs}
        return self.data_source.stock(**processed_kwargs)
```

### 10. `Fund`

A component for accessing mutual fund data.

#### Python Implementation

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

### 11. `MSNComponents`

A specialized component for handling MSN-specific data (international markets, forex, crypto).

#### Python Implementation

```python
class MSNComponents:
    """
    Class (lớp) quản lý các chức năng của thư viện Vnstock liên quan đến thị trường ngoại hối.
    """
    def __init__(self, symbol: Optional[str]='EURUSD', source: str = "MSN"):
        self.symbol = symbol.upper()
        self.source = source.upper()
        if self.source not in ["MSN"]:
            raise ValueError("Hiện tại chỉ có nguồn dữ liệu từ MSN được hỗ trợ.")
        self._initialize_components()

    def _initialize_components(self):
        # Initialize each sub-component with the current symbol
        self.quote = Quote(self.symbol, self.source)
        self.listing = Listing(source=self.source)

        if self.source != "MSN":
            logger.warning("Thông tin niêm yết sẽ được truy xuất từ MSN")

    def update_symbol(self, symbol: str):
        """
        Update the symbol for all sub-components.
        """
        self.symbol = symbol.upper()
        self._initialize_components()
```

## TypeScript Implementation

### TypeScript Interfaces

```typescript
/**
 * Configuration options
 */
interface ConfigOptions {
  defaultSource?: string;
  defaultTimeout?: number;
  defaultRetries?: number;
  cacheSize?: number;
  logLevel?: LogLevel;
}

/**
 * Base component options
 */
interface ComponentOptions {
  symbol?: string;
  source?: string;
  showLog?: boolean;
}

/**
 * Financial data options
 */
interface FinanceOptions extends ComponentOptions {
  period?: 'quarter' | 'annual';
  getAll?: boolean;
}

/**
 * Quote history options
 */
interface HistoryOptions {
  start?: string;
  end?: string;
  interval?: string;
  requestId?: string;
}

/**
 * Symbol type
 */
enum AssetType {
  Stock = 'stock',
  Index = 'index',
  Derivative = 'derivative',
  CoveredWarrant = 'coveredWarr',
  Bond = 'bond',
}
```

### TypeScript Implementation

```typescript
import { throttle, memoize } from 'lodash';
import { Logger, LogLevel, createLogger } from './logger';
import retry from 'async-retry';

/**
 * Global configuration for the API
 */
class Config {
  static DEFAULT_SOURCE = 'VCI';
  static DEFAULT_TIMEOUT = 30; // seconds
  static DEFAULT_RETRIES = 3;
  static CACHE_SIZE = 128;
  static LOG_LEVEL = LogLevel.Info;

  private static logger: Logger = createLogger('Config');

  /**
   * Update configuration settings
   */
  static setup(options: ConfigOptions): void {
    Object.entries(options).forEach(([key, value]) => {
      const configKey = `DEFAULT_${key.toUpperCase()}`;
      if (key in this && value !== undefined) {
        this[key] = value;
        this.logger.info(`Updated config: ${key}=${value}`);
      }
    });
  }
}

/**
 * Abstract base component
 */
abstract class BaseComponent {
  protected symbol?: string;
  protected source: string;
  protected sourceModule: string;
  protected dataSource: any;
  protected logger: Logger;

  // Should be overridden by subclasses
  protected static readonly SUPPORTED_SOURCES: string[] = [];

  constructor(options: ComponentOptions = {}) {
    const { symbol, source = Config.DEFAULT_SOURCE } = options;

    this.symbol = symbol?.toUpperCase();
    this.source = source.toUpperCase();
    this.logger = createLogger(this.constructor.name);

    this.validateSource();
    this.sourceModule = `${this.source.toLowerCase()}`;
    this.dataSource = this.loadDataSource();
  }

  /**
   * Validate that the source is supported
   */
  private validateSource(): void {
    const supportedSources = (this.constructor as typeof BaseComponent)
      .SUPPORTED_SOURCES;

    if (!supportedSources.includes(this.source)) {
      throw new Error(
        `Only data sources from ${supportedSources.join(', ')} are supported.`
      );
    }
  }

  /**
   * Load the appropriate data source module
   * This must be implemented by subclasses
   */
  protected abstract loadDataSource(): any;
}

/**
 * Stock components facade class
 */
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

  protected loadDataSource(): any {
    // Return self as this component doesn't directly load a data source
    return this;
  }
}

/**
 * Quote component for historical and real-time price data
 */
export class Quote extends BaseComponent {
  static readonly SUPPORTED_SOURCES = ['VCI', 'TCBS', 'MSN'];

  constructor(options: ComponentOptions) {
    super(options);

    if (!this.symbol) {
      throw new Error('Symbol is required for Quote component');
    }
  }

  /**
   * Load the appropriate Quote module for the selected source
   */
  protected loadDataSource(): any {
    // In a real implementation, this would dynamically import
    // the correct source module

    // For now, this is a simplified implementation
    if (this.source === 'VCI') {
      return new VciQuoteAdapter(this.symbol);
    } else if (this.source === 'TCBS') {
      return new TcbsQuoteAdapter(this.symbol);
    } else if (this.source === 'MSN') {
      return new MsnQuoteAdapter(this.symbol.toLowerCase());
    }

    throw new Error(`No implementation available for source: ${this.source}`);
  }

  /**
   * Update the data source with a new symbol
   */
  private updateDataSource(symbol?: string): void {
    if (symbol) {
      this.symbol = symbol.toUpperCase();
      this.dataSource = this.loadDataSource();
    }
  }

  /**
   * Get historical price data
   */
  async history(options: HistoryOptions = {}): Promise<any> {
    const { symbol, ...otherOptions } = options;

    // Handle special case for MSN source
    if (this.source === 'MSN' && symbol) {
      // In a real implementation, this would map the symbol
      // For now, just log a message
      this.logger.info(`Converting ${symbol} to MSN symbol`);
    }

    this.updateDataSource(symbol);

    return retry(async () => this.dataSource.history(otherOptions), {
      retries: Config.DEFAULT_RETRIES,
    });
  }

  /**
   * Get intraday trading data
   */
  async intraday(options: { symbol?: string } = {}): Promise<any> {
    const { symbol, ...otherOptions } = options;
    this.updateDataSource(symbol);

    return retry(async () => this.dataSource.intraday(otherOptions), {
      retries: Config.DEFAULT_RETRIES,
    });
  }

  /**
   * Get order book / price depth data
   */
  async priceDepth(options: { symbol?: string } = {}): Promise<any> {
    const { symbol, ...otherOptions } = options;
    this.updateDataSource(symbol);

    return retry(async () => this.dataSource.priceDepth(otherOptions), {
      retries: Config.DEFAULT_RETRIES,
    });
  }
}

// Other component classes would be implemented similarly...
```

## Implementation Details

### Architecture

1. **Component-Based Design**:

   - The API uses a component-based architecture where each component manages one aspect of financial data
   - Each component delegates to a specific data source implementation (VCI, TCBS, MSN)
   - This allows consistent access to different data sources while handling source-specific details internally

2. **Dependency Injection**:

   - Components are configured with a data source at initialization
   - The appropriate source implementation is dynamically loaded using Python's importlib
   - This allows easy switching between data sources with minimal changes

3. **Performance Optimizations**:
   - Results are cached using LRU cache with configurable size
   - Retries are implemented for network operations to handle transient failures
   - Components are initialized lazily when needed

### Data Flow

1. User creates a StockComponents or other high-level component with a symbol and source
2. Component loads the appropriate source-specific implementation
3. User calls methods on the component, which delegate to the source implementation
4. Results are cached for subsequent calls with the same parameters
5. Error handling and retries are managed transparently

## Dependencies

### Required Packages

For the Python implementation:

- `importlib` - For dynamic module loading
- `functools.lru_cache` - For result caching
- `tenacity` - For implementing retries
- `typing` - For type annotations
- `pandas` - For data manipulation and representation
- `logging` - For logging

For the TypeScript implementation:

- `lodash` - For utilities like memoize and throttle
- `async-retry` - For implementing retries
- Custom logger implementation
- Adapter classes for each data source

## Usage Examples

### Basic Usage with StockComponents

```typescript
import { StockComponents } from './api';

// Create a stock component for VNM using VCI as the data source
const vnm = new StockComponents({
  symbol: 'VNM',
  source: 'VCI',
});

// Get historical data
const history = await vnm.quote.history({
  start: '2023-01-01',
  end: '2023-12-31',
  interval: '1D',
});

// Get company information
const profile = await vnm.company?.profile();

// Get financial statements
const incomeStatement = await vnm.finance?.incomeStatement({
  period: 'annual',
});

// Switch to another symbol
vnm.updateSymbol('HPG');
const hpgHistory = await vnm.quote.history();
```

### Using Individual Components

```typescript
import { Quote, Listing } from './api';

// Create a quote component for VNM using TCBS as the data source
const quote = new Quote({
  symbol: 'VNM',
  source: 'TCBS',
});

// Get historical data
const history = await quote.history({
  interval: '1D',
});

// Get intraday data
const intraday = await quote.intraday();

// Create a listing component using VCI as the data source
const listing = new Listing({ source: 'VCI' });

// Get all symbols
const allSymbols = await listing.allSymbols();

// Get symbols by industry
const bankStocks = await listing.symbolsByIndustries({
  industry: 'Banks',
});
```

### Accessing International Markets

```typescript
import { MSNComponents } from './api';

// Create an MSN component for EURUSD
const forex = new MSNComponents({
  symbol: 'EURUSD',
  source: 'MSN',
});

// Get historical forex data
const eurUsdHistory = await forex.quote.history();

// Switch to a crypto symbol
forex.updateSymbol('BTC');

// Get historical Bitcoin data
const btcHistory = await forex.quote.history();
```

## Implementation Notes

1. **Error Handling**:

   - The Python implementation uses Vietnamese error messages
   - The TypeScript implementation should use English or support i18n
   - All network operations should be wrapped in appropriate try/catch blocks

2. **Caching Strategy**:

   - Python uses LRU cache from functools
   - TypeScript should use a similar caching mechanism (lodash memoize, Map, etc.)
   - Consider cache invalidation strategies for frequently changing data

3. **Dynamic Loading**:

   - Python uses importlib to dynamically load source modules
   - TypeScript can use dynamic imports or a factory pattern to achieve similar functionality

4. **Rate Limiting**:

   - Consider adding rate limiting to prevent exceeding API quotas
   - This can be implemented using throttling or debouncing on API calls

5. **Proxying**:

   - The Python implementation uses simple delegation to data sources
   - TypeScript can use Proxy objects for more sophisticated intercepting of method calls

6. **Logging**:
   - Both implementations should use consistent logging
   - Consider log levels (debug, info, warning, error) for different scenarios
   - Allow users to configure logging verbosity
