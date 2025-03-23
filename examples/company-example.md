# Company Module Documentation

This documentation accompanies the executable Python file `company-example.py` which demonstrates the usage of the Company module in vnstock.

## Requirements

1. Each function must log:

   - Input parameters and their data structures
   - Output data structures
   - All API requests and responses to/from third-party APIs
   - Logs should be written to `examples/samples/company` folder

2. Data Sources:
   - VCI (Vietnam Capital Investment)
   - TCBS (Techcombank Securities)
   - MSN (Microsoft Network)

## Available Functions

### 1. Overview

```python
def overview(
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns company overview information including:

- Company name
- Stock code
- Industry
- Charter capital
- Founding date
- Website
- Address
- Phone
- Email

### 2. Profile

```python
def profile(
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns detailed company profile including:

- Business description
- Management team
- Shareholders
- Subsidiaries
- Related companies

### 3. Events

```python
def events(
    start: str,                    # Required: Start date in "YYYY-MM-DD" format
    end: Optional[str] = None,     # Optional: End date in "YYYY-MM-DD" format
    to_df: bool = True,            # Optional: Return as DataFrame (True) or JSON (False)
    show_log: bool = False         # Optional: Show debug logs
) -> Union[pd.DataFrame, str]
```

Returns company events including:

- Date
- Event type
- Description
- Impact
- Status

## Example Usage

### VCI Data Source

```python
from vnstock import Company

# Initialize company object
company = Company(symbol='VCI', source='VCI')

# Get company overview
df = company.overview(show_log=True)

# Get company profile
df = company.profile(show_log=True)

# Get company events
df = company.events(
    start='2024-01-01',
    end='2024-03-20',
    show_log=True
)
```

### TCBS Data Source

```python
from vnstock import Company

# Initialize company object
company = Company(symbol='TCB', source='TCBS')

# Get company overview
df = company.overview(show_log=True)

# Get company profile
df = company.profile(show_log=True)

# Get company events
df = company.events(
    start='2024-01-01',
    end='2024-03-20',
    show_log=True
)
```

## Logging Structure

Each function call will generate logs in the following structure:

```
examples/samples/company/
├── vci/
│   ├── overview/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   ├── profile/
│   │   ├── input.json
│   │   ├── output.json
│   │   └── api_logs.json
│   └── events/
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
