# Listing Module Documentation

This documentation accompanies the executable Python file `listing-example.py` which demonstrates the usage of the Listing module in vnstock.

## Requirements

1. Each function must log:

   - Input parameters and their data structures
   - Output data structures
   - All API requests and responses to/from third-party APIs
   - Logs should be written to `examples/samples/listing` folder

2. Data Sources:
   - VCI (Vietnam Capital Investment)
   - TCBS (Techcombank Securities)
   - MSN (Microsoft Network)

## Available Functions

### 1. All Symbols

```python
def all_symbols(
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns list of all available symbols including:

- Stock code
- Company name
- Exchange
- Industry
- Market cap
- Listing date

### 2. Search Symbols

```python
def search_symbols(
    query: str,                    # Required: Search query
    exchange: Optional[str] = None, # Optional: Exchange filter (HOSE, HNX, UPCOM)
    industry: Optional[str] = None, # Optional: Industry filter
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns matching symbols based on search criteria including:

- Stock code
- Company name
- Exchange
- Industry
- Market cap
- Listing date

### 3. Symbol Details

```python
def symbol_details(
    symbol: str,                   # Required: Stock code
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns detailed information for a specific symbol including:

- Company name
- Stock code
- Exchange
- Industry
- Market cap
- Listing date
- Par value
- Outstanding shares
- Foreign ownership limit
- Trading unit

## Example Usage

### VCI Data Source

```python
from vnstock import Listing

# Initialize listing object
listing = Listing(source='VCI')

# Get all symbols
df = listing.all_symbols(show_log=True)

# Search symbols
df = listing.search_symbols(
    query='bank',
    exchange='HOSE',
    show_log=True
)

# Get symbol details
df = listing.symbol_details(
    symbol='VCI',
    show_log=True
)
```

### TCBS Data Source

```python
from vnstock import Listing

# Initialize listing object
listing = Listing(source='TCBS')

# Get all symbols
df = listing.all_symbols(show_log=True)

# Search symbols
df = listing.search_symbols(
    query='bank',
    exchange='HOSE',
    show_log=True
)

# Get symbol details
df = listing.symbol_details(
    symbol='TCB',
    show_log=True
)
```

### MSN Data Source

```python
from vnstock import Listing

# Initialize listing object
listing = Listing(source='MSN')

# Search symbols
df = listing.search_symbols(
    query='MSFT',
    show_log=True
)

# Get symbol details
df = listing.symbol_details(
    symbol='MSFT',
    show_log=True
)
```

## Logging Structure

Each function call will generate logs in the following structure:

```
examples/samples/listing/
├── vci/
│   ├── all_symbols/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   ├── search_symbols/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   └── symbol_details/
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
