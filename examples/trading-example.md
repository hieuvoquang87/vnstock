# Trading Module Documentation

This documentation accompanies the executable Python file `trading-example.py` which demonstrates the usage of the Trading module in vnstock.

## Requirements

1. Each function must log:

   - Input parameters and their data structures
   - Output data structures
   - All API requests and responses to/from third-party APIs
   - Logs should be written to `examples/samples/trading` folder

2. Data Sources:
   - VCI (Vietnam Capital Investment)
   - TCBS (Techcombank Securities)
   - MSN (Microsoft Network)

## Available Functions

### 1. Price Board

```python
def price_board(
    symbols: List[str],            # Required: List of stock codes
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns current trading information including:

- Current price
- Change
- Change percent
- Open price
- High price
- Low price
- Volume
- Value
- Bid/Ask prices
- Bid/Ask volumes

### 2. Order Book

```python
def order_book(
    symbol: str,                   # Required: Stock code
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns order book information including:

- Bid prices and volumes
- Ask prices and volumes
- Total bid/ask volume
- Total bid/ask value
- Price levels

### 3. Trading History

```python
def trading_history(
    symbol: str,                   # Required: Stock code
    page_size: Optional[int] = 100, # Optional: Number of records per request
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns recent trading history including:

- Time
- Price
- Volume
- Value
- Type (buy/sell)
- Order type
- Order size

### 4. Market Overview

```python
def market_overview(
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns market overview information including:

- Market indices
- Market status
- Trading volume
- Trading value
- Number of advancing/declining stocks
- Number of unchanged stocks
- Number of limit up/down stocks

## Example Usage

### VCI Data Source

```python
from vnstock import Trading

# Initialize trading object
trading = Trading(source='VCI')

# Get price board
df = trading.price_board(
    symbols=['VCI', 'VCB', 'ACB'],
    show_log=True
)

# Get order book
df = trading.order_book(
    symbol='VCI',
    show_log=True
)

# Get trading history
df = trading.trading_history(
    symbol='VCI',
    page_size=1000,
    show_log=True
)

# Get market overview
df = trading.market_overview(show_log=True)
```

### TCBS Data Source

```python
from vnstock import Trading

# Initialize trading object
trading = Trading(source='TCBS')

# Get price board
df = trading.price_board(
    symbols=['TCB', 'VCB', 'ACB'],
    show_log=True
)

# Get order book
df = trading.order_book(
    symbol='TCB',
    show_log=True
)

# Get trading history
df = trading.trading_history(
    symbol='TCB',
    page_size=1000,
    show_log=True
)

# Get market overview
df = trading.market_overview(show_log=True)
```

### MSN Data Source

```python
from vnstock import Trading

# Initialize trading object
trading = Trading(source='MSN')

# Get price board
df = trading.price_board(
    symbols=['MSFT', 'AAPL', 'GOOGL'],
    show_log=True
)

# Get order book
df = trading.order_book(
    symbol='MSFT',
    show_log=True
)

# Get trading history
df = trading.trading_history(
    symbol='MSFT',
    page_size=1000,
    show_log=True
)

# Get market overview
df = trading.market_overview(show_log=True)
```

## Logging Structure

Each function call will generate logs in the following structure:

```
examples/samples/trading/
├── vci/
│   ├── price_board/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   ├── order_book/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   ├── trading_history/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   └── market_overview/
│       ├── input.json
│       ├── output.json
│       └── api_logs.json
├── tcbs/
│   └── ...
└── msn/
    └── ...
```

Each log file will contain:

- input.json: Function parameters and their data structures
- output.json: Returned data structure
- api_logs.json: API request/response details including:
  - URL
  - Headers
  - Parameters
  - Response status
  - Response data
  - Timestamps

> **Important Note**: The log files should maintain consistent names (input.json, output.json, api_logs.json) and override previous runs. This ensures that:
>
> 1. Each test run starts with a clean slate
> 2. The most recent test results are always available
> 3. Historical test results are not accumulated
> 4. File management is simplified
