# Implementation of Vnstock Unified API

## Overview

The `Vnstock` class serves as the main entry point for the library, providing a unified API to access various data sources and components. It acts as a factory for creating specialized components like `StockComponents`, `MSNComponents`, and `Fund`, based on the requested asset type and data source.

## Class Structure

The `Vnstock` class provides a fluent interface for accessing different types of financial data:

```
Vnstock
├── stock() → StockComponents
├── fx() → MSNComponents
├── crypto() → MSNComponents
├── world_index() → MSNComponents
└── fund() → Fund
```

## Class Definition

### Python Implementation

```python
class Vnstock:
    """
    Class (lớp) chính quản lý các chức năng của thư viện Vnstock.
    """

    SUPPORTED_SOURCES = ["VCI", "TCBS", "MSN"]
    msn_symbol_map = {**_CURRENCY_ID_MAP, **_GLOBAL_INDICES, **_CRYPTO_ID_MAP}

    def __init__(self, symbol:str=None, source:str="VCI", show_log:bool=True):
        """
        Hàm khởi tạo của lớp Vnstock.

        Tham số:
            - source (str): Nguồn dữ liệu chứng khoán. Mặc định là 'VCI' (Vietstock). Các giá trị hợp lệ là 'VCI', 'TCBS', 'MSN'.
            - show_log (bool): Hiển thị log hoạt động của chương trình. Mặc định là True.
        """
        self.symbol = symbol
        self.source = source.upper()
        self.show_log = show_log
        if self.source not in self.SUPPORTED_SOURCES:
            raise ValueError(F"Hiện tại chỉ có nguồn dữ liệu từ {', '.join(self.SUPPORTED_SOURCES)} được hỗ trợ.")
        self.source = source.upper()
        # if show_log is False, disable logging
        if not show_log:
            logger.setLevel(logging.CRITICAL)
```

### Component Methods

#### Stock Component

Creates a `StockComponents` instance for accessing stock-related data.

```python
def stock(self, symbol: Optional[str]=None, source: Optional[str] = None):
    if symbol is None:
        self.symbol = 'VN30F1M'
        logger.info("Mã chứng khoán không được chỉ định, chương trình mặc định sử dụng VN30F1M")
    else:
         self.symbol = symbol

    if source is None:
        source = self.source
    else:
        self.symbol = symbol

    return StockComponents(self.symbol, source, show_log=self.show_log)
```

#### Foreign Exchange Component

Creates an `MSNComponents` instance for accessing foreign exchange (FX) data.

```python
def fx(self, symbol: Optional[str]='EURUSD', source: Optional[str] = "MSN"):
    if symbol:
        self.symbol = self.msn_symbol_map[symbol]
    return MSNComponents(self.symbol, source)
```

#### Cryptocurrency Component

Creates an `MSNComponents` instance for accessing cryptocurrency data.

```python
def crypto(self, symbol: Optional[str]='BTC', source: Optional[str] = "MSN"):
    if symbol:
        self.symbol = self.msn_symbol_map[symbol]
    return MSNComponents(self.symbol, source)
```

#### World Index Component

Creates an `MSNComponents` instance for accessing global market index data.

```python
def world_index(self, symbol: Optional[str]='DJI', source: Optional[str] = "MSN"):
    if symbol:
        self.symbol = self.msn_symbol_map[symbol]
    return MSNComponents(self.symbol, source)
```

#### Fund Component

Creates a `Fund` instance for accessing mutual fund data.

```python
def fund(self, source: Optional[str] = "FMARKET"):
    return Fund(source)
```

## TypeScript Implementation

### Class Definition

```typescript
/**
 * Main class for managing vnstock library functionality
 */
export class Vnstock {
  private symbol: string | null;
  private source: string;
  private readonly showLog: boolean;
  private static readonly SUPPORTED_SOURCES = ['VCI', 'TCBS', 'MSN'];
  private static readonly msn_symbol_map = {
    ...CURRENCY_ID_MAP,
    ...GLOBAL_INDICES,
    ...CRYPTO_ID_MAP,
  };

  /**
   * Create a new Vnstock instance
   *
   * @param options Configuration options
   */
  constructor({
    symbol = null,
    source = 'VCI',
    showLog = true,
  }: {
    symbol?: string | null;
    source?: string;
    showLog?: boolean;
  } = {}) {
    this.symbol = symbol;
    this.source = source.toUpperCase();
    this.showLog = showLog;

    if (!Vnstock.SUPPORTED_SOURCES.includes(this.source)) {
      throw new ValidationError(
        `Currently only data sources from ${Vnstock.SUPPORTED_SOURCES.join(
          ', '
        )} are supported.`
      );
    }

    // Configure logger based on showLog
    configureLogger(showLog ? 'info' : 'critical');
  }

  /**
   * Access stock components for stock data
   *
   * @param options Stock options
   * @returns StockComponents instance
   */
  public stock({
    symbol = null,
    source = null,
  }: {
    symbol?: string | null;
    source?: string | null;
  } = {}): StockComponents {
    if (symbol === null) {
      this.symbol = 'VN30F1M';
      logger.info('No symbol specified, defaulting to VN30F1M');
    } else {
      this.symbol = symbol;
    }

    const finalSource = source === null ? this.source : source.toUpperCase();

    return new StockComponents({
      symbol: this.symbol as string,
      source: finalSource,
      showLog: this.showLog,
    });
  }

  /**
   * Access foreign exchange (FX) data
   *
   * @param options FX options
   * @returns MSNComponents instance
   */
  public fx({
    symbol = 'EURUSD',
    source = 'MSN',
  }: {
    symbol?: string;
    source?: string;
  } = {}): MSNComponents {
    if (symbol) {
      this.symbol = Vnstock.msn_symbol_map[symbol];
    }

    return new MSNComponents({
      symbol: this.symbol as string,
      source,
    });
  }

  /**
   * Access cryptocurrency data
   *
   * @param options Crypto options
   * @returns MSNComponents instance
   */
  public crypto({
    symbol = 'BTC',
    source = 'MSN',
  }: {
    symbol?: string;
    source?: string;
  } = {}): MSNComponents {
    if (symbol) {
      this.symbol = Vnstock.msn_symbol_map[symbol];
    }

    return new MSNComponents({
      symbol: this.symbol as string,
      source,
    });
  }

  /**
   * Access world index data
   *
   * @param options Index options
   * @returns MSNComponents instance
   */
  public worldIndex({
    symbol = 'DJI',
    source = 'MSN',
  }: {
    symbol?: string;
    source?: string;
  } = {}): MSNComponents {
    if (symbol) {
      this.symbol = Vnstock.msn_symbol_map[symbol];
    }

    return new MSNComponents({
      symbol: this.symbol as string,
      source,
    });
  }

  /**
   * Access mutual fund data
   *
   * @param options Fund options
   * @returns Fund instance
   */
  public fund({
    source = 'FMARKET',
  }: {
    source?: string;
  } = {}): Fund {
    return new Fund({ source });
  }
}
```

## Usage Examples

### Python Example

```python
from vnstock import Vnstock

# Create a Vnstock instance
vnstock = Vnstock(source='VCI', show_log=True)

# Get stock data
stock = vnstock.stock(symbol='VNM')
quote = stock.quote
history_data = quote.history(start='2023-01-01', end='2023-12-31')

# Get forex data
fx = vnstock.fx(symbol='EURUSD')
fx_data = fx.quote.history(start='2023-01-01', end='2023-12-31')

# Get crypto data
crypto = vnstock.crypto(symbol='BTC')
crypto_data = crypto.quote.history(start='2023-01-01', end='2023-12-31')

# Get world index data
index = vnstock.world_index(symbol='DJI')
index_data = index.quote.history(start='2023-01-01', end='2023-12-31')

# Get fund data
fund = vnstock.fund()
fund_list = fund.list()
```

### TypeScript Example

```typescript
import { Vnstock } from 'vnstock';

async function fetchData() {
  // Create a Vnstock instance
  const vnstock = new Vnstock({
    source: 'VCI',
    showLog: true,
  });

  // Get stock data
  const stock = vnstock.stock({ symbol: 'VNM' });
  const history = await stock.quote.history({
    start: '2023-01-01',
    end: '2023-12-31',
  });

  // Get forex data
  const fx = vnstock.fx({ symbol: 'EURUSD' });
  const fxData = await fx.quote.history({
    start: '2023-01-01',
    end: '2023-12-31',
  });

  // Get crypto data
  const crypto = vnstock.crypto({ symbol: 'BTC' });
  const cryptoData = await crypto.quote.history({
    start: '2023-01-01',
    end: '2023-12-31',
  });

  // Get world index data
  const index = vnstock.worldIndex({ symbol: 'DJI' });
  const indexData = await index.quote.history({
    start: '2023-01-01',
    end: '2023-12-31',
  });

  // Get fund data
  const fund = vnstock.fund();
  const fundList = await fund.list();
}
```

## Implementation Details

### Factory Pattern

The `Vnstock` class implements a factory pattern to create specialized components based on the type of financial asset and data source requested.

### Fluent Interface

The API is designed as a fluent interface, allowing method chaining for a more intuitive API:

```python
# Python
data = Vnstock().stock(symbol='VNM').quote.history(start='2023-01-01', end='2023-12-31')

# TypeScript
const data = await new Vnstock().stock({ symbol: 'VNM' }).quote.history({
  start: '2023-01-01',
  end: '2023-12-31'
});
```

### Symbol Mapping

The class provides symbol mapping for MSN data sources, which allows using common symbols like 'BTC' instead of MSN's internal symbol format.

### Configuration Management

The class manages configuration options like the data source and logging preferences, which are then passed to the created components.

### Error Handling

The constructor validates the source parameter and throws a `ValueError` if an unsupported source is provided.

## Component Relationships

The `Vnstock` class serves as the entry point to the component hierarchy:

```
Vnstock
├── StockComponents
│   ├── Quote
│   ├── Company
│   ├── Financial
│   └── ...
├── MSNComponents
│   ├── Quote
│   ├── Summary
│   └── ...
└── Fund
    ├── List
    └── Details
```

## Dependencies

### Python Dependencies

- `importlib`: For dynamic module imports
- `typing`: For type annotations
- `logging`: For logging configuration
- `vnstock.core.utils.logger`: For logger creation
- `vnstock.common.data.data_explorer`: For data components
- `vnstock.explorer.msn.const`: For symbol mappings

### TypeScript Dependencies

- Custom Components: `StockComponents`, `MSNComponents`, `Fund`
- Constants: `CURRENCY_ID_MAP`, `GLOBAL_INDICES`, `CRYPTO_ID_MAP`
- Utilities: Logger, Error handling

## Implementation Notes

1. **TypeScript Parameter Structure**: The TypeScript implementation uses object parameter syntax for better readability and to make all parameters optional.

2. **Default Values**: Both implementations provide sensible defaults for all parameters, making the API easy to use with minimal configuration.

3. **Type Safety**: The TypeScript implementation adds strong typing to ensure parameters are correctly passed.

4. **Error Handling**: The TypeScript implementation uses custom error classes for better error categorization.

5. **Symbol State**: Both implementations maintain the current symbol state, which is updated when component methods are called.

6. **Module Structure**: For TypeScript, consider the following organization:

   ```
   src/
   ├── index.ts              (Exports Vnstock class)
   ├── vnstock.ts            (Main Vnstock class)
   ├── components/           (Component implementations)
   │   ├── stock.ts          (StockComponents)
   │   ├── msn.ts            (MSNComponents)
   │   └── fund.ts           (Fund)
   ├── constants/            (Constants and mappings)
   └── utils/                (Utility functions)
   ```

7. **Documentation**: Include comprehensive JSDoc comments in the TypeScript implementation to provide IDE hints and generate documentation.

8. **Testing**: Test each component method with various parameter combinations to ensure correct behavior.
