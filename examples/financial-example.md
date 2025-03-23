# Financial Module Documentation

This documentation accompanies the executable Python file `financial-example.py` which demonstrates the usage of the Financial module in vnstock.

## Requirements

1. Each function must log:

   - Input parameters and their data structures
   - Output data structures
   - All API requests and responses to/from third-party APIs
   - Logs should be written to `examples/samples/financial` folder

2. Data Sources:
   - VCI (Vietnam Capital Investment)
   - TCBS (Techcombank Securities)
   - MSN (Microsoft Network)

## Available Functions

### 1. Balance Sheet

```python
def balance_sheet(
    period: str = "year",          # Optional: Period type ("year" or "quarter")
    lang: str = "vi",              # Optional: Language ("vi" or "en")
    dropna: bool = True,           # Optional: Drop rows with all NaN values
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns balance sheet data including:

- Assets
- Liabilities
- Equity
- Total assets
- Total liabilities and equity

### 2. Income Statement

```python
def income_statement(
    period: str = "year",          # Optional: Period type ("year" or "quarter")
    lang: str = "vi",              # Optional: Language ("vi" or "en")
    dropna: bool = True,           # Optional: Drop rows with all NaN values
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns income statement data including:

- Revenue
- Cost of goods sold
- Gross profit
- Operating expenses
- Operating income
- Net income

### 3. Cash Flow

```python
def cash_flow(
    period: str = "year",          # Optional: Period type ("year" or "quarter")
    dropna: bool = True,           # Optional: Drop rows with all NaN values
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns cash flow data including:

- Operating activities
- Investing activities
- Financing activities
- Net cash flow
- Beginning cash
- Ending cash

### 4. Financial Ratios

```python
def ratio(
    period: str = "year",          # Optional: Period type ("year" or "quarter")
    lang: str = "vi",              # Optional: Language ("vi" or "en")
    dropna: bool = True,           # Optional: Drop rows with all NaN values
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns financial ratios including:

- Liquidity ratios
- Profitability ratios
- Efficiency ratios
- Leverage ratios
- Market ratios

## Example Usage

### VCI Data Source

```python
from vnstock import Finance

# Initialize finance object
finance = Finance(symbol='VCI', source='VCI')

# Get balance sheet
df = finance.balance_sheet(
    period='year',
    lang='vi',
    show_log=True
)

# Get income statement
df = finance.income_statement(
    period='quarter',
    lang='en',
    show_log=True
)

# Get cash flow
df = finance.cash_flow(
    period='year',
    show_log=True
)

# Get financial ratios
df = finance.ratio(
    period='year',
    lang='vi',
    show_log=True
)
```

### TCBS Data Source

```python
from vnstock import Finance

# Initialize finance object
finance = Finance(symbol='TCB', source='TCBS')

# Get balance sheet
df = finance.balance_sheet(
    period='year',
    lang='vi',
    show_log=True
)

# Get income statement
df = finance.income_statement(
    period='quarter',
    lang='en',
    show_log=True
)

# Get cash flow
df = finance.cash_flow(
    period='year',
    show_log=True
)

# Get financial ratios
df = finance.ratio(
    period='year',
    lang='vi',
    show_log=True
)
```

## Logging Structure

Each function call will generate logs in the following structure:

```
examples/samples/financial/
├── vci/
│   ├── balance_sheet/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   ├── income_statement/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   ├── cash_flow/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   └── ratio/
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
