# vnstock3 - Comprehensive Usage Documentation

This document provides detailed information on how to use the vnstock3 package, including its functionality, how to invoke each function, and the data structures for inputs and outputs.

## Table of Contents

- [vnstock3 - Comprehensive Usage Documentation](#vnstock3---comprehensive-usage-documentation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Core Interface](#core-interface)
    - [1. Using the Main Interface](#1-using-the-main-interface)
    - [2. Using Specific Component Classes](#2-using-specific-component-classes)
    - [3. Using Source-Specific Components](#3-using-source-specific-components)
  - [Stock Data](#stock-data)
    - [Historical Quotes](#historical-quotes)
    - [Intraday Data](#intraday-data)
    - [Price Depth](#price-depth)
  - [Listing Data](#listing-data)
    - [All Symbols](#all-symbols)
    - [Symbols by Category](#symbols-by-category)
  - [Trading Data](#trading-data)
    - [Price Board](#price-board)
  - [Company Information](#company-information)
    - [Company Overview](#company-overview)
    - [Company Profile](#company-profile)
    - [Shareholders](#shareholders)
    - [Insider Deals](#insider-deals)
    - [Subsidiaries](#subsidiaries)
    - [Officers](#officers)
    - [Events](#events)
    - [News](#news)
    - [Dividends](#dividends)
  - [Financial Data](#financial-data)
    - [Balance Sheet](#balance-sheet)
    - [Income Statement](#income-statement)
    - [Cash Flow](#cash-flow)
    - [Financial Ratios](#financial-ratios)
  - [Screener](#screener)
  - [International Markets](#international-markets)
    - [Forex](#forex)
    - [Cryptocurrencies](#cryptocurrencies)
    - [World Indices](#world-indices)
  - [Fund Data](#fund-data)
  - [Miscellaneous](#miscellaneous)
    - [Exchange Rates](#exchange-rates)
    - [Gold Prices](#gold-prices)
  - [Exporting Data](#exporting-data)

## Introduction

vnstock3 is an open-source solution for stock market analysis, providing comprehensive data access for Vietnamese stock market as well as international markets. It offers data from multiple sources with a unified and intuitive interface.

## Installation

```bash
pip install -U vnstock
```

## Core Interface

vnstock3 provides multiple ways to access the package functionality:

### 1. Using the Main Interface

```python
from vnstock import Vnstock

# Initialize with default source (VCI)
stock = Vnstock().stock(symbol='VCI', source='VCI')
```

### 2. Using Specific Component Classes

```python
from vnstock import Quote, Listing, Trading, Company, Finance, Screener

# Initialize a specific component
quote = Quote(symbol='ACB', source='VCI')
```

### 3. Using Source-Specific Components

```python
from vnstock.explorer.vci import Quote, Company, Finance, Trading
# or
from vnstock.explorer.tcbs import Quote, Company, Finance, Trading, Screener
```

## Stock Data

### Historical Quotes

Retrieve historical price data for stocks.

**Using the main interface:**

```python
from vnstock import Vnstock
stock = Vnstock().stock(symbol='ACB', source='VCI')
historical_data = stock.quote.history(
    start='2024-01-01',    # Start date (required)
    end='2024-03-19',      # End date (optional, defaults to current date)
    interval='1D',         # Interval: '1m', '5m', '15m', '30m', '1H', '1D', '1W', '1M' (optional, default '1D')
    to_df=True,            # Return as DataFrame (optional, default True)
    show_log=False,        # Show detailed logs (optional, default False)
    count_back=None,       # Number of records to return from the end (optional)
    floating=2             # Decimal precision for prices (optional, default 2)
)
```

**Using the Quote class directly:**

```python
from vnstock import Quote
quote = Quote(symbol='ACB', source='VCI')
historical_data = quote.history(
    start='2024-01-01',
    end='2024-03-19',
    interval='1D'
)
```

**Output data structure:**

The function returns a pandas DataFrame with the following columns:

- `time`: Timestamp of the data point
- `open`: Opening price
- `high`: Highest price during the interval
- `low`: Lowest price during the interval
- `close`: Closing price
- `volume`: Trading volume
- `symbol`: Stock symbol
- `source`: Data source
- `asset_type`: Type of asset (stock, index, etc.)

### Intraday Data

Retrieve tick-by-tick transaction data.

```python
intraday_data = stock.quote.intraday(
    page_size=10_000,      # Number of records to retrieve (optional, default 100)
    last_time=None,        # Timestamp to get data after (optional)
    to_df=True,            # Return as DataFrame (optional, default True)
    show_log=False         # Show detailed logs (optional, default False)
)
```

**Output data structure:**

The function returns a pandas DataFrame with the following columns:

- `time`: Timestamp of the transaction
- `price`: Transaction price
- `volume`: Transaction volume
- `side`: Buy/sell side ('B' for buy, 'S' for sell)
- `position`: Market position
- `symbol`: Stock symbol
- `source`: Data source
- `asset_type`: Type of asset

### Price Depth

Retrieve price depth statistics.

```python
price_depth = stock.quote.price_depth(
    to_df=True,            # Return as DataFrame (optional, default True)
    show_log=False         # Show detailed logs (optional, default False)
)
```

**Output data structure:**

The function returns a pandas DataFrame with information about price levels and trading volumes.

## Listing Data

### All Symbols

Retrieve all listed symbols in the market.

```python
from vnstock import Listing
listing = Listing(source='VCI')
all_symbols = listing.all_symbols()
```

**Output data structure:**

The function returns a pandas DataFrame with information about all listed securities including:

- Symbol
- Company name
- Exchange
- Industry

### Symbols by Category

Retrieve symbols filtered by different categories.

```python
# By industry
industry_symbols = listing.symbols_by_industries()

# By exchange
exchange_symbols = listing.symbols_by_exchange()

# By index group
vn30_symbols = listing.symbols_by_group(group='VN30')

# Get industry classifications
industries = listing.industries_icb()

# Get futures indices
futures = listing.all_future_indices()

# Get covered warrants
warrants = listing.all_covered_warrant()

# Get bonds
bonds = listing.all_bonds()

# Get government bonds
gov_bonds = listing.all_government_bonds()
```

## Trading Data

### Price Board

Retrieve real-time prices for multiple symbols at once.

```python
from vnstock import Trading
trading = Trading(source='VCI')
price_board = trading.price_board(['VCB', 'ACB', 'TCB', 'BID'])
```

**Output data structure:**

The function returns a pandas DataFrame with current trading information for the requested symbols including:

- Symbol
- Current price
- Price change
- Percent change
- Volume
- Best bid/ask prices and volumes

## Company Information

### Company Overview

Retrieve general information about a company.

```python
from vnstock import Company
company = Company(symbol='ACB', source='VCI')
overview = company.overview()
```

or

```python
from vnstock import Vnstock
stock = Vnstock().stock(symbol='ACB', source='VCI')
overview = stock.company.overview()
```

**Output data structure:**

The function returns a pandas DataFrame or Series with general information about the company such as:

- Company name
- Exchange
- Industry
- Business areas
- Founding date
- Listing date

### Company Profile

Retrieve detailed profile information.

```python
profile = company.profile()
```

### Shareholders

Retrieve major shareholder information.

```python
shareholders = company.shareholders()
```

### Insider Deals

Retrieve information about insider transactions.

```python
insider_deals = company.insider_deals()
```

### Subsidiaries

Retrieve information about company subsidiaries.

```python
subsidiaries = company.subsidiaries()
```

### Officers

Retrieve information about company officers/executives.

```python
officers = company.officers()
```

### Events

Retrieve corporate events.

```python
events = company.events()
```

### News

Retrieve company-related news.

```python
news = company.news()
```

### Dividends

Retrieve dividend history.

```python
dividends = company.dividends()
```

## Financial Data

### Balance Sheet

Retrieve balance sheet data.

```python
from vnstock import Finance
finance = Finance(symbol='ACB', source='VCI')
balance_sheet = finance.balance_sheet(
    period='year',         # 'year' or 'quarter' (optional, default 'quarter')
    lang='vi',             # 'vi' or 'en' for language (optional, default 'vi')
    dropna=True            # Remove NA values (optional, default True)
)
```

or

```python
from vnstock import Vnstock
stock = Vnstock().stock(symbol='VCI', source='VCI')
balance_sheet = stock.finance.balance_sheet(
    period='year',
    lang='vi',
    dropna=True
)
```

**Output data structure:**

The function returns a pandas DataFrame with balance sheet items as columns and time periods as rows.

### Income Statement

Retrieve income statement data.

```python
income_statement = finance.income_statement(
    period='year',         # 'year' or 'quarter' (optional, default 'quarter')
    lang='vi',             # 'vi' or 'en' for language (optional, default 'vi')
    dropna=True            # Remove NA values (optional, default True)
)
```

**Output data structure:**

The function returns a pandas DataFrame with income statement items as columns and time periods as rows.

### Cash Flow

Retrieve cash flow statement data.

```python
cash_flow = finance.cash_flow(
    period='year',         # 'year' or 'quarter' (optional, default 'quarter')
    lang='vi',             # 'vi' or 'en' for language (optional, default 'vi')
    dropna=True            # Remove NA values (optional, default True)
)
```

**Output data structure:**

The function returns a pandas DataFrame with cash flow items as columns and time periods as rows.

### Financial Ratios

Retrieve financial ratios.

```python
ratios = finance.ratio(
    period='year',         # 'year' or 'quarter' (optional, default 'quarter')
    lang='vi',             # 'vi' or 'en' for language (optional, default 'vi')
    dropna=True            # Remove NA values (optional, default True)
)
```

**Output data structure:**

The function returns a pandas DataFrame with financial ratios as columns and time periods as rows.

## Screener

Screen stocks based on various criteria.

```python
from vnstock import Screener
screener = Screener(source='TCBS')
screened_stocks = screener.stock(
    params={"exchangeName": "HOSE,HNX,UPCOM"},  # Screening parameters
    limit=1700              # Maximum number of results to return
)
```

**Output data structure:**

The function returns a pandas DataFrame with filtered stocks based on the provided criteria.

## International Markets

### Forex

Retrieve forex data.

```python
from vnstock import Vnstock
fx = Vnstock().fx(symbol='JPYVND', source='MSN')
fx_data = fx.quote.history(
    start='2024-01-02',
    end='2024-03-20',
    interval='1D'
)
```

### Cryptocurrencies

Retrieve cryptocurrency data.

```python
crypto = Vnstock().crypto(symbol='BTC', source='MSN')
crypto_data = crypto.quote.history(
    start='2024-01-02',
    end='2024-03-20',
    interval='1D'
)
```

### World Indices

Retrieve world market indices.

```python
world_index = Vnstock().world_index(symbol='DJI', source='MSN')
index_data = world_index.quote.history(
    start='2024-01-02',
    end='2024-03-20',
    interval='1D'
)
```

## Fund Data

Retrieve mutual fund data.

```python
from vnstock.explorer.fmarket.fund import Fund
fund = Fund()
fund_listing = fund.listing()
```

## Miscellaneous

### Exchange Rates

Retrieve foreign exchange rates.

```python
from vnstock.explorer.misc import vcb_exchange_rate
exchange_rates = vcb_exchange_rate(date='2024-03-21')
```

### Gold Prices

Retrieve gold prices.

```python
from vnstock.explorer.misc import sjc_gold_price
gold_prices = sjc_gold_price()
```

## Exporting Data

All data returned from vnstock functions are pandas DataFrames or Series, which can be easily exported to various formats:

```python
# Export to Excel
data.to_excel('file_path.xlsx', index=False)

# Export to CSV
data.to_csv('file_path.csv', index=False)
```
