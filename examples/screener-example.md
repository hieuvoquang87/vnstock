# Screener Module Documentation

This documentation accompanies the executable Python file `screener-example.py` which demonstrates the usage of the Screener module in vnstock.

## Requirements

1. Each function must log:

   - Input parameters and their data structures
   - Output data structures
   - All API requests and responses to/from third-party APIs
   - Logs should be written to `examples/samples/screener` folder

2. Data Sources:
   - VCI (Vietnam Capital Investment)
   - TCBS (Techcombank Securities)
   - MSN (Microsoft Network)

## Available Functions

### 1. Stock Screener

```python
def stock(
    params: Dict[str, Any],        # Required: Screening parameters
    limit: Optional[int] = None,    # Optional: Maximum number of results
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Screens stocks based on various criteria including:

- Exchange (HOSE, HNX, UPCOM)
- Industry
- Market cap
- Price range
- Volume range
- PE ratio
- PB ratio
- ROE
- ROA
- Debt ratio
- Dividend yield

### 2. Technical Screener

```python
def technical(
    params: Dict[str, Any],        # Required: Technical analysis parameters
    limit: Optional[int] = None,    # Optional: Maximum number of results
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Screens stocks based on technical indicators including:

- Moving averages (MA, EMA)
- RSI
- MACD
- Bollinger Bands
- Volume indicators
- Price patterns
- Support/Resistance levels

### 3. Fundamental Screener

```python
def fundamental(
    params: Dict[str, Any],        # Required: Fundamental analysis parameters
    limit: Optional[int] = None,    # Optional: Maximum number of results
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Screens stocks based on fundamental criteria including:

- Financial ratios
- Growth rates
- Profitability metrics
- Valuation metrics
- Dividend metrics
- Debt metrics
- Efficiency metrics

## Example Usage

### VCI Data Source

```python
from vnstock import Screener

# Initialize screener object
screener = Screener(source='VCI')

# Screen stocks
df = screener.stock(
    params={
        "exchangeName": "HOSE",
        "industry": "Banking",
        "marketCap": ">1000000000000",  # >1T VND
        "pe": "<20",
        "pb": "<2",
        "roe": ">15"
    },
    limit=100,
    show_log=True
)

# Screen by technical indicators
df = screener.technical(
    params={
        "ma20": ">ma50",
        "rsi": "<30",
        "macd": ">0",
        "volume": ">1000000"
    },
    show_log=True
)

# Screen by fundamental criteria
df = screener.fundamental(
    params={
        "revenueGrowth": ">20",
        "profitGrowth": ">15",
        "roe": ">20",
        "debtRatio": "<50"
    },
    show_log=True
)
```

### TCBS Data Source

```python
from vnstock import Screener

# Initialize screener object
screener = Screener(source='TCBS')

# Screen stocks
df = screener.stock(
    params={
        "exchangeName": "HOSE",
        "industry": "Banking",
        "marketCap": ">1000000000000",  # >1T VND
        "pe": "<20",
        "pb": "<2",
        "roe": ">15"
    },
    limit=100,
    show_log=True
)

# Screen by technical indicators
df = screener.technical(
    params={
        "ma20": ">ma50",
        "rsi": "<30",
        "macd": ">0",
        "volume": ">1000000"
    },
    show_log=True
)

# Screen by fundamental criteria
df = screener.fundamental(
    params={
        "revenueGrowth": ">20",
        "profitGrowth": ">15",
        "roe": ">20",
        "debtRatio": "<50"
    },
    show_log=True
)
```

## Logging Structure

Each function call will generate logs in the following structure:

```
examples/samples/screener/
├── vci/
│   ├── stock/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   ├── technical/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   └── fundamental/
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
