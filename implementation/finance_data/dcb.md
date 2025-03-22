# Implementation of DCB Module (Derivatives, Covered Warrants, and Bonds)

**Original Python Implementation**: [dcb.py](/vnstock/explorer/misc/dcb.py)


## Overview

The DCB Module provides comprehensive access to data related to derivatives, covered warrants, and bonds in the Vietnamese financial market. This module enables users to access and analyze specialized financial instruments beyond traditional stocks, offering capabilities for both professional traders and institutional investors.

The module enables users to:

1. Access historical and real-time data for derivatives (primarily futures contracts)
2. Retrieve price and specification data for covered warrants
3. Work with bond data including pricing, yields, and terms
4. Analyze trading volume and price patterns for these specialized instruments
5. Monitor market activity and liquidity across different instrument types

## Component Structure

The DCB functionality is integrated into the existing component architecture, with specific handling for derivatives, covered warrants, and bonds. The asset type detection system determines the appropriate data flow and transformations:

```
DCBComponents
├── DerivativeQuote - Futures contract prices and specifications
├── CoveredWarrantQuote - Covered warrant data
├── BondQuote - Bond pricing and yield data
├── DerivativeTrading - Derivatives trading information
└── DCBListing - Listings of available instruments by type
```

## Python Implementation

### DCBComponents

The `DCBComponents` class specializes the data components for derivatives, covered warrants, and bonds:

```python
class DCBComponents(BaseComponent):
    SUPPORTED_SOURCES = ["VCI", "TCBS"]

    def __init__(self, symbol: str, source: str = Config.DEFAULT_SOURCE, show_log: bool = True):
        super().__init__(symbol, source)
        self.show_log = show_log
        self.asset_type = get_asset_type(self.symbol)
        if not show_log:
            logger.setLevel(logging.CRITICAL)
        self._initialize_components()

    def _initialize_components(self):
        # Determine the asset type and initialize appropriate components
        if self.asset_type == "derivative":
            self.quote = DerivativeQuote(self.symbol, source=self.source)
            self.trading = DerivativeTrading(self.symbol, source=self.source)
            self.listing = DCBListing(category="derivative", source=self.source)
        elif self.asset_type == "coveredWarr":
            self.quote = CoveredWarrantQuote(self.symbol, source=self.source)
            self.listing = DCBListing(category="coveredWarrant", source=self.source)
        elif self.asset_type == "bond":
            self.quote = BondQuote(self.symbol, source=self.source)
            self.listing = DCBListing(category="bond", source=self.source)
        else:
            logger.warning(f"Asset type {self.asset_type} not supported by DCBComponents")

    def update_symbol(self, symbol: str):
        self.symbol = symbol.upper()
        self.asset_type = get_asset_type(self.symbol)
        self._initialize_components()
```

### DerivativeQuote Component

The `DerivativeQuote` component specializes in futures contracts and other derivatives:

```python
class DerivativeQuote(Quote):
    """Component for derivatives pricing and related information"""

    def __init__(self, symbol: str, source: str = Config.DEFAULT_SOURCE):
        super().__init__(symbol, source)
        self.validate_derivative_symbol()

    def validate_derivative_symbol(self):
        """Validate that the symbol is a properly formatted derivative symbol"""
        if get_asset_type(self.symbol) != "derivative":
            raise ValueError(f"Symbol {self.symbol} is not a valid derivative symbol")

    def specifications(self, **kwargs):
        """Get contract specifications for the derivative"""
        return self.data_source.specifications(**kwargs)

    def settlement_price(self, **kwargs):
        """Get settlement price for the derivative"""
        return self.data_source.settlement_price(**kwargs)

    def open_interest(self, **kwargs):
        """Get open interest for the derivative"""
        return self.data_source.open_interest(**kwargs)
```

### CoveredWarrantQuote Component

The `CoveredWarrantQuote` component handles covered warrant data:

```python
class CoveredWarrantQuote(Quote):
    """Component for covered warrant data and information"""

    def __init__(self, symbol: str, source: str = Config.DEFAULT_SOURCE):
        super().__init__(symbol, source)
        if get_asset_type(self.symbol) != "coveredWarr":
            raise ValueError(f"Symbol {self.symbol} is not a valid covered warrant symbol")

    def details(self, **kwargs):
        """Get detailed information about the covered warrant"""
        return self.data_source.details(**kwargs)

    def underlying(self, **kwargs):
        """Get information about the underlying asset"""
        return self.data_source.underlying(**kwargs)

    def issuer(self, **kwargs):
        """Get information about the issuer"""
        return self.data_source.issuer(**kwargs)
```

### BondQuote Component

The `BondQuote` component handles bond data:

```python
class BondQuote(Quote):
    """Component for bond data and information"""

    def __init__(self, symbol: str, source: str = Config.DEFAULT_SOURCE):
        super().__init__(symbol, source)
        if get_asset_type(self.symbol) != "bond":
            raise ValueError(f"Symbol {self.symbol} is not a valid bond symbol")

    def details(self, **kwargs):
        """Get detailed information about the bond"""
        return self.data_source.details(**kwargs)

    def yield_data(self, **kwargs):
        """Get yield information for the bond"""
        return self.data_source.yield_data(**kwargs)

    def coupon_schedule(self, **kwargs):
        """Get coupon payment schedule"""
        return self.data_source.coupon_schedule(**kwargs)
```

### DerivativeTrading Component

The `DerivativeTrading` component provides trading data for derivatives:

```python
class DerivativeTrading(Trading):
    """Component for derivative trading data"""

    def __init__(self, symbol: str, source: str = Config.DEFAULT_SOURCE):
        super().__init__(symbol, source)
        if get_asset_type(self.symbol) != "derivative":
            raise ValueError(f"Symbol {self.symbol} is not a valid derivative symbol")

    def trading_volume(self, **kwargs):
        """Get trading volume data for the derivative"""
        return self.data_source.trading_volume(**kwargs)

    def market_makers(self, **kwargs):
        """Get information about market makers"""
        return self.data_source.market_makers(**kwargs)
```

### DCBListing Component

The `DCBListing` component provides listing information for various DCB instruments:

```python
class DCBListing(Listing):
    """Component for listing derivatives, covered warrants, and bonds"""

    def __init__(self, category: str = "derivative", source: str = Config.DEFAULT_SOURCE):
        super().__init__(source=source)
        self.category = category

    def all(self, **kwargs):
        """Get all instruments in the specified category"""
        method_name = f"all_{self.category}s"
        if hasattr(self.data_source, method_name):
            return getattr(self.data_source, method_name)(**kwargs)
        else:
            raise NotImplementedError(f"Method {method_name} not implemented for source {self.source}")

    def all_derivatives(self, **kwargs):
        """Get all available derivatives"""
        return self.data_source.all_derivatives(**kwargs)

    def all_covered_warrants(self, **kwargs):
        """Get all available covered warrants"""
        return self.data_source.all_covered_warrants(**kwargs)

    def all_bonds(self, **kwargs):
        """Get all available bonds"""
        return self.data_source.all_bonds(**kwargs)
```

## TypeScript Implementation

### DCBComponents

```typescript
export class DCBComponents extends BaseComponent {
  static readonly SUPPORTED_SOURCES = ['VCI', 'TCBS'];

  readonly quote?: DerivativeQuote | CoveredWarrantQuote | BondQuote;
  readonly trading?: DerivativeTrading;
  readonly listing?: DCBListing;
  readonly assetType: AssetType;

  constructor(options: ComponentOptions) {
    super(options);

    if (!this.symbol) {
      throw new Error('Symbol is required for DCBComponents');
    }

    this.assetType = getAssetType(this.symbol);
    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Initialize based on asset type
    if (this.assetType === AssetType.Derivative) {
      this.quote = new DerivativeQuote({
        symbol: this.symbol,
        source: this.source,
      });
      this.trading = new DerivativeTrading({
        symbol: this.symbol,
        source: this.source,
      });
      this.listing = new DCBListing({
        category: 'derivative',
        source: this.source,
      });
    } else if (this.assetType === AssetType.CoveredWarrant) {
      this.quote = new CoveredWarrantQuote({
        symbol: this.symbol,
        source: this.source,
      });
      this.listing = new DCBListing({
        category: 'coveredWarrant',
        source: this.source,
      });
    } else if (this.assetType === AssetType.Bond) {
      this.quote = new BondQuote({
        symbol: this.symbol,
        source: this.source,
      });
      this.listing = new DCBListing({
        category: 'bond',
        source: this.source,
      });
    } else {
      this.logger.warn(
        `Asset type ${this.assetType} not supported by DCBComponents`
      );
    }
  }

  updateSymbol(symbol: string): void {
    this.symbol = symbol.toUpperCase();
    this.assetType = getAssetType(this.symbol);
    this.initializeComponents();
  }
}
```

### Specialized Components

```typescript
export class DerivativeQuote extends Quote {
  constructor(options: ComponentOptions) {
    super(options);
    this.validateDerivativeSymbol();
  }

  private validateDerivativeSymbol(): void {
    if (getAssetType(this.symbol) !== AssetType.Derivative) {
      throw new Error(`Symbol ${this.symbol} is not a valid derivative symbol`);
    }
  }

  async specifications(options: any = {}): Promise<any> {
    return await this.dataSource.specifications(options);
  }

  async settlementPrice(options: any = {}): Promise<any> {
    return await this.dataSource.settlementPrice(options);
  }

  async openInterest(options: any = {}): Promise<any> {
    return await this.dataSource.openInterest(options);
  }
}

export class CoveredWarrantQuote extends Quote {
  constructor(options: ComponentOptions) {
    super(options);
    if (getAssetType(this.symbol) !== AssetType.CoveredWarrant) {
      throw new Error(
        `Symbol ${this.symbol} is not a valid covered warrant symbol`
      );
    }
  }

  async details(options: any = {}): Promise<any> {
    return await this.dataSource.details(options);
  }

  async underlying(options: any = {}): Promise<any> {
    return await this.dataSource.underlying(options);
  }

  async issuer(options: any = {}): Promise<any> {
    return await this.dataSource.issuer(options);
  }
}

export class BondQuote extends Quote {
  constructor(options: ComponentOptions) {
    super(options);
    if (getAssetType(this.symbol) !== AssetType.Bond) {
      throw new Error(`Symbol ${this.symbol} is not a valid bond symbol`);
    }
  }

  async details(options: any = {}): Promise<any> {
    return await this.dataSource.details(options);
  }

  async yieldData(options: any = {}): Promise<any> {
    return await this.dataSource.yieldData(options);
  }

  async couponSchedule(options: any = {}): Promise<any> {
    return await this.dataSource.couponSchedule(options);
  }
}

export class DerivativeTrading extends Trading {
  constructor(options: ComponentOptions) {
    super(options);
    if (getAssetType(this.symbol) !== AssetType.Derivative) {
      throw new Error(`Symbol ${this.symbol} is not a valid derivative symbol`);
    }
  }

  async tradingVolume(options: any = {}): Promise<any> {
    return await this.dataSource.tradingVolume(options);
  }

  async marketMakers(options: any = {}): Promise<any> {
    return await this.dataSource.marketMakers(options);
  }
}

export class DCBListing extends Listing {
  readonly category: string;

  constructor(options: { category: string; source: string }) {
    super({ source: options.source });
    this.category = options.category;
  }

  async all(options: any = {}): Promise<any> {
    const methodName = `all${
      this.category.charAt(0).toUpperCase() + this.category.slice(1)
    }s`;

    if (typeof this.dataSource[methodName] === 'function') {
      return await this.dataSource[methodName](options);
    } else {
      throw new Error(
        `Method ${methodName} not implemented for source ${this.source}`
      );
    }
  }

  async allDerivatives(options: any = {}): Promise<any> {
    return await this.dataSource.allDerivatives(options);
  }

  async allCoveredWarrants(options: any = {}): Promise<any> {
    return await this.dataSource.allCoveredWarrants(options);
  }

  async allBonds(options: any = {}): Promise<any> {
    return await this.dataSource.allBonds(options);
  }
}
```

## Usage Examples

### Python Examples

#### Working with Derivatives

```python
from vnstock.common.vnstock import Vnstock

# Initialize with a derivatives symbol
vnstock = Vnstock()
dcb = vnstock.dcb(symbol="VN30F1M")

# Get historical price data for a derivative
historical_data = dcb.quote.history(
    start="2023-01-01",
    end="2023-12-31",
    interval="1D"
)

# Get contract specifications
specifications = dcb.quote.specifications()

# Get settlement price
settlement = dcb.quote.settlement_price()

# Get open interest data
open_interest = dcb.quote.open_interest()

# Get trading volume information
trading_volume = dcb.trading.trading_volume(
    start="2023-01-01",
    end="2023-01-31"
)

# Get all available derivatives
all_derivatives = dcb.listing.all_derivatives()
```

#### Working with Covered Warrants

```python
from vnstock.common.vnstock import Vnstock

# Initialize with a covered warrant symbol
vnstock = Vnstock()
dcb = vnstock.dcb(symbol="CVNM2306")

# Get historical price data for a covered warrant
historical_data = dcb.quote.history(
    start="2023-01-01",
    end="2023-12-31",
    interval="1D"
)

# Get detailed information about the warrant
details = dcb.quote.details()

# Get information about the underlying asset
underlying = dcb.quote.underlying()

# Get information about the issuer
issuer = dcb.quote.issuer()

# Get all available covered warrants
all_warrants = dcb.listing.all_covered_warrants()
```

#### Working with Bonds

```python
from vnstock.common.vnstock import Vnstock

# Initialize with a bond symbol
vnstock = Vnstock()
dcb = vnstock.dcb(symbol="CII424002")

# Get historical price data for a bond
historical_data = dcb.quote.history(
    start="2023-01-01",
    end="2023-12-31",
    interval="1D"
)

# Get detailed information about the bond
details = dcb.quote.details()

# Get yield information
yield_data = dcb.quote.yield_data()

# Get coupon payment schedule
coupon_schedule = dcb.quote.coupon_schedule()

# Get all available bonds
all_bonds = dcb.listing.all_bonds()
```

### TypeScript Examples

#### Working with Derivatives

```typescript
import { Vnstock } from 'vnstock-ts';

async function getDerivativeData() {
  // Initialize with a derivatives symbol
  const vnstock = new Vnstock();
  const dcb = await vnstock.dcb({ symbol: 'VN30F1M' });

  // Get historical price data for a derivative
  const historicalData = await dcb.quote.history({
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1D',
  });

  // Get contract specifications
  const specifications = await dcb.quote.specifications();

  // Get settlement price
  const settlement = await dcb.quote.settlementPrice();

  // Get open interest data
  const openInterest = await dcb.quote.openInterest();

  // Get trading volume information
  const tradingVolume = await dcb.trading.tradingVolume({
    start: '2023-01-01',
    end: '2023-01-31',
  });

  // Get all available derivatives
  const allDerivatives = await dcb.listing.allDerivatives();

  console.log({
    historicalData,
    specifications,
    settlement,
    openInterest,
    tradingVolume,
    allDerivatives,
  });
}

getDerivativeData();
```

#### Working with Covered Warrants

```typescript
import { Vnstock } from 'vnstock-ts';

async function getCoveredWarrantData() {
  // Initialize with a covered warrant symbol
  const vnstock = new Vnstock();
  const dcb = await vnstock.dcb({ symbol: 'CVNM2306' });

  // Get historical price data for a covered warrant
  const historicalData = await dcb.quote.history({
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1D',
  });

  // Get detailed information about the warrant
  const details = await dcb.quote.details();

  // Get information about the underlying asset
  const underlying = await dcb.quote.underlying();

  // Get information about the issuer
  const issuer = await dcb.quote.issuer();

  // Get all available covered warrants
  const allWarrants = await dcb.listing.allCoveredWarrants();

  console.log({
    historicalData,
    details,
    underlying,
    issuer,
    allWarrants,
  });
}

getCoveredWarrantData();
```

#### Working with Bonds

```typescript
import { Vnstock } from 'vnstock-ts';

async function getBondData() {
  // Initialize with a bond symbol
  const vnstock = new Vnstock();
  const dcb = await vnstock.dcb({ symbol: 'CII424002' });

  // Get historical price data for a bond
  const historicalData = await dcb.quote.history({
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1D',
  });

  // Get detailed information about the bond
  const details = await dcb.quote.details();

  // Get yield information
  const yieldData = await dcb.quote.yieldData();

  // Get coupon payment schedule
  const couponSchedule = await dcb.quote.couponSchedule();

  // Get all available bonds
  const allBonds = await dcb.listing.allBonds();

  console.log({
    historicalData,
    details,
    yieldData,
    couponSchedule,
    allBonds,
  });
}

getBondData();
```

## Implementation Details

### Asset Type Detection

The module relies on a specialized asset type detection system to identify different financial instruments based on their symbol structure:

1. **Derivatives**: Identified by specific patterns like `VN30F1M` (1-month future) or `VN30F2024` (yearly future)
2. **Covered Warrants**: Typically 8 characters in length with specific formatting
3. **Bonds**: Identified by patterns like `CII424002` or `GB10302` with specific length and format

### Data Flow

1. The user initializes a `DCBComponents` instance with a symbol
2. The symbol's asset type is determined and appropriate subcomponents are instantiated
3. Component methods call appropriate data source implementations based on the source parameter
4. Data source implementations make API requests to retrieve data
5. Responses are transformed into standardized formats and returned

### Data Sources

The module supports multiple data sources for DCB instruments:

1. **VCI** (Vietstock): Primary source for derivatives data
2. **TCBS** (Techcombank Securities): For bond data and some derivatives
3. **FMARKET**: For specialized bond market data

Each data source implementation handles the specific API endpoints and response formats for its service.

### Symbol Validation

Special validation is performed for DCB instruments:

1. Derivative symbols are validated against specific patterns (`VN30F1M`, `VN30F2024`)
2. Covered warrant symbols are validated for proper length and format
3. Bond symbols are validated against specific patterns

### Price Handling

The module includes special handling for DCB instrument prices:

1. Derivatives are not subject to the price scaling applied to stocks
2. Bonds may have prices represented as percentage of face value
3. Covered warrants have special price scaling based on exercise terms

## Dependencies

### Python Dependencies

- `pandas`: For data manipulation and DataFrame operations
- `requests`: For HTTP requests to APIs
- `numpy`: For numerical operations
- `datetime`: For date handling and manipulation
- Custom utilities:
  - `get_asset_type`: For determining the type of financial instrument
  - `data_transform`: For specialized transformations of DCB data

### TypeScript Dependencies

- `axios`: For HTTP requests
- `dayjs`: For date manipulation
- `lodash`: For utility functions
- Custom utilities:
  - `getAssetType`: For determining the type of financial instrument
  - `dataTransform`: For specialized transformations of DCB data

## Implementation Notes

1. **Specialized Handling**: DCB instruments require specialized handling due to their different price structures, trading mechanisms, and data formats
2. **Extended Quote Class**: The specialized quote classes extend the base Quote class, adding instrument-specific functionality
3. **Data Transformations**: Special transformations are applied to derivatives data to account for their contract specifications
4. **Symbol Patterns**: Recognition of various symbol patterns is critical for proper handling of DCB instruments
5. **Market Structure**: The module accounts for the different market structure of derivatives exchanges versus stock exchanges
6. **API Customization**: API endpoints and parameters are customized for each instrument type
7. **Risk Factors**: Additional information related to risk factors is provided for derivatives and covered warrants
8. **Expiration Handling**: Special handling for expiration dates and contract rollover in derivatives
9. **Term Structure**: Bond data includes term structure information not relevant to stocks
10. **Cash Flow Projections**: Bond analysis includes projected coupon payments and yield calculations
