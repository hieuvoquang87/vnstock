# Quote Module Documentation

This documentation accompanies the executable Python file `quote-example.py` which demonstrates the usage of the Quote module in vnstock.

## Requirements

1. Each function must log:

   - Input parameters and their data structures
   - Output data structures
   - All API requests and responses to/from third-party APIs
   - Logs should be written to `examples/samples/quote` folder

2. Data Sources:

   - VCI (Vietnam Capital Investment)
   - TCBS (Techcombank Securities)
   - MSN (Microsoft Network)

3. Supported Asset Types:
   - Stocks
   - Indices
   - Derivatives
   - Cryptocurrencies
   - Forex

## Available Functions

### 1. History

```python
def history(
    start: str,                    # Required: Start date in "YYYY-MM-DD" format
    end: Optional[str] = None,     # Optional: End date in "YYYY-MM-DD" format
    interval: Optional[str] = "1D", # Optional: Time interval (1m, 5m, 15m, 30m, 1H, 1D, 1W, 1M)
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False,        # Optional: Show debug logs
    count_back: Optional[int] = 365, # Optional: Number of records from end date
    floating: Optional[int] = 2    # Optional: Number of decimal places for prices
) -> Union[pd.DataFrame, str]
```

Returns historical price data with columns:

- time: Timestamp
- open: Opening price
- high: Highest price
- low: Lowest price
- close: Closing price
- volume: Trading volume

### 2. Intraday

```python
def intraday(
    page_size: Optional[int] = 100,  # Optional: Number of records per request
    last_time: Optional[str] = None, # Optional: Cut-off time for data
    to_df: bool = True,              # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False           # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns intraday trading data with columns:

- time: Timestamp
- price: Trading price
- volume: Trading volume
- value: Trading value
- type: Trade type (buy/sell)

### 3. Price Depth

```python
def price_depth(
    to_df: bool = True,     # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False  # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns price depth statistics with columns:

- price: Price level
- volume: Volume at price level
- value: Value at price level
- buy_volume: Buy volume at price level
- sell_volume: Sell volume at price level

## Example Usage

### VCI Data Source

```python
from vnstock import Quote

# Initialize quote object
quote = Quote(symbol='VCI', source='VCI')

# Get historical data
df = quote.history(
    start='2024-01-01',
    end='2024-03-20',
    interval='1D',
    show_log=True
)

# Get intraday data
df = quote.intraday(
    page_size=1000,
    show_log=True
)

# Get price depth
df = quote.price_depth(show_log=True)
```

### TCBS Data Source

```python
from vnstock import Quote

# Initialize quote object
quote = Quote(symbol='TCBS', source='TCBS')

# Get historical data
df = quote.history(
    start='2024-01-01',
    end='2024-03-20',
    interval='1D',
    show_log=True
)

# Get intraday data
df = quote.intraday(
    page_size=1000,
    show_log=True
)

# Get price depth
df = quote.price_depth(show_log=True)
```

### MSN Data Source

```python
from vnstock import Quote

# Initialize quote object
quote = Quote(symbol='MSN', source='MSN')

# Get historical data
df = quote.history(
    start='2024-01-01',
    end='2024-03-20',
    interval='1D',
    show_log=True
)
```

## Logging Structure

Each function call will generate logs in the following structure:

```
examples/samples/quote/
├── vci/
│   ├── history/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   ├── intraday/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   └── price_depth/
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
