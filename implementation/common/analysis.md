# Implementation of Analysis Module

## Overview

The Analysis module in the `vnstock` package provides functionality for analyzing financial data from various sources, including technical and fundamental analysis. In the current state of the Python package, analysis functionality is distributed across several modules rather than being centralized in a single location. This documentation consolidates the existing analysis capabilities and proposes a more structured approach for the TypeScript implementation.

## Purpose

The Analysis module serves several key purposes:

1. Providing access to analyst reports from brokers
2. Enabling technical analysis functionality (indicators, signals, patterns)
3. Facilitating fundamental analysis through financial ratios and metrics
4. Offering comparison tools to evaluate multiple securities

## Python Implementation

### Current State

In the Python implementation, analysis functionality is spread across several locations:

1. Basic analyst reports functionality in the `Company` class
2. Financial ratios in the `Finance` class
3. Technical indicators referenced in screener and constants files
4. Placeholder `analysis.py` files in data source modules

Here's an example of how analyst reports are accessed through the `Company` class:

```python
import pandas as pd
from vnstock.explorer.vci import Company

# Get analyst reports for VNM
company = Company(symbol="VNM")
reports = company.reports()
```

And financial ratios are accessed through the `Finance` class:

```python
from vnstock.explorer.vci import Finance

# Get financial ratios for VNM
finance = Finance(symbol="VNM")
ratios = finance.ratio()
```

While technical indicators would typically be accessed through the `Explorer` interface:

```python
from vnstock import Explorer
from vnstock.common.data import DataExplorer

# Create an explorer instance for TCBS
explorer = Explorer(source="TCBS")
data = explorer.trading.history(symbol="VNM", start_date="2023-01-01", end_date="2023-12-31")

# Calculate RSI
# (Note: Direct technical indicator calculation is not fully implemented in the current version)
```

### Proposed Unified Analysis Interface

For a more coherent Python implementation, the following structure is recommended:

```python
from dataclasses import dataclass
from typing import Optional, Union, Dict, List, Any, Tuple
import pandas as pd
import numpy as np
from vnstock.core.utils.logger import get_logger
from vnstock.common.data.data_explorer import DataExplorer

logger = get_logger(__name__)

class Analysis:
    """
    Class providing analysis functionality for financial data.
    """

    def __init__(self, source: str = "TCBS", show_log: bool = False):
        """
        Initialize the Analysis class.

        Args:
            source: The data source to use ("TCBS", "VCI", etc.)
            show_log: Whether to show detailed logs
        """
        self.source = source
        self.data_explorer = DataExplorer(source=source)
        self.show_log = show_log

        if not show_log:
            logger.setLevel("ERROR")

    def reports(self, symbol: str) -> pd.DataFrame:
        """
        Get analyst reports for a symbol.

        Args:
            symbol: The stock symbol

        Returns:
            DataFrame containing analyst reports
        """
        # This is a wrapper around the source-specific implementation
        try:
            return self.data_explorer.company(symbol=symbol).reports()
        except AttributeError:
            logger.error(f"Source {self.source} does not support reports")
            return pd.DataFrame()

    def financial_ratios(self, symbol: str, period: Optional[str] = "quarter",
                         lang: Optional[str] = "en", dropna: Optional[bool] = True) -> pd.DataFrame:
        """
        Get financial ratios for a symbol.

        Args:
            symbol: The stock symbol
            period: Time period ('quarter', 'annual', etc.)
            lang: Language for the report
            dropna: Whether to drop NaN values

        Returns:
            DataFrame containing financial ratios
        """
        # This is a wrapper around the source-specific implementation
        return self.data_explorer.ratio(symbol=symbol, period=period, lang=lang, dropna=dropna)

    def technical_indicators(self, symbol: str, indicators: List[str],
                             start_date: Optional[str] = None,
                             end_date: Optional[str] = None) -> pd.DataFrame:
        """
        Calculate technical indicators for a symbol.

        Args:
            symbol: The stock symbol
            indicators: List of technical indicators to calculate
            start_date: Start date for historical data
            end_date: End date for historical data

        Returns:
            DataFrame with price data and indicators
        """
        # Get historical price data
        prices = self.data_explorer.trading.history(
            symbol=symbol,
            start_date=start_date,
            end_date=end_date
        )

        if prices.empty:
            return pd.DataFrame()

        # Calculate indicators
        result = prices.copy()

        for indicator in indicators:
            if indicator.upper() == "RSI":
                result = self._calculate_rsi(result)
            elif indicator.upper() == "MACD":
                result = self._calculate_macd(result)
            elif indicator.upper() == "BOLLINGER":
                result = self._calculate_bollinger_bands(result)
            # Add more indicators as needed

        return result

    def _calculate_rsi(self, df: pd.DataFrame, period: int = 14, column: str = "close") -> pd.DataFrame:
        """
        Calculate the Relative Strength Index (RSI).

        Args:
            df: DataFrame with price data
            period: RSI period
            column: Column name for price data

        Returns:
            DataFrame with RSI column added
        """
        # Ensure we have the required column
        if column not in df.columns:
            logger.error(f"Column {column} not found in DataFrame")
            return df

        # Calculate price changes
        delta = df[column].diff()

        # Separate gains and losses
        gain = delta.copy()
        loss = delta.copy()
        gain[gain < 0] = 0
        loss[loss > 0] = a0
        loss = abs(loss)

        # Calculate average gain and loss
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()

        # Calculate RS and RSI
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))

        # Add RSI to the DataFrame
        df["RSI"] = rsi

        return df

    def _calculate_macd(self, df: pd.DataFrame, column: str = "close",
                        fast_period: int = 12, slow_period: int = 26,
                        signal_period: int = 9) -> pd.DataFrame:
        """
        Calculate Moving Average Convergence Divergence (MACD).

        Args:
            df: DataFrame with price data
            column: Column name for price data
            fast_period: Fast EMA period
            slow_period: Slow EMA period
            signal_period: Signal EMA period

        Returns:
            DataFrame with MACD columns added
        """
        # Ensure we have the required column
        if column not in df.columns:
            logger.error(f"Column {column} not found in DataFrame")
            return df

        # Calculate EMAs
        fast_ema = df[column].ewm(span=fast_period, adjust=False).mean()
        slow_ema = df[column].ewm(span=slow_period, adjust=False).mean()

        # Calculate MACD and signal
        macd = fast_ema - slow_ema
        signal = macd.ewm(span=signal_period, adjust=False).mean()
        histogram = macd - signal

        # Add MACD to the DataFrame
        df["MACD"] = macd
        df["MACD_Signal"] = signal
        df["MACD_Histogram"] = histogram

        return df

    def _calculate_bollinger_bands(self, df: pd.DataFrame, column: str = "close",
                                  period: int = 20, std_dev: float = 2.0) -> pd.DataFrame:
        """
        Calculate Bollinger Bands.

        Args:
            df: DataFrame with price data
            column: Column name for price data
            period: Moving average period
            std_dev: Standard deviation multiplier

        Returns:
            DataFrame with Bollinger Bands columns added
        """
        # Ensure we have the required column
        if column not in df.columns:
            logger.error(f"Column {column} not found in DataFrame")
            return df

        # Calculate middle band (SMA)
        middle_band = df[column].rolling(window=period).mean()

        # Calculate standard deviation
        std = df[column].rolling(window=period).std()

        # Calculate upper and lower bands
        upper_band = middle_band + (std * std_dev)
        lower_band = middle_band - (std * std_dev)

        # Add Bollinger Bands to the DataFrame
        df["BB_Middle"] = middle_band
        df["BB_Upper"] = upper_band
        df["BB_Lower"] = lower_band

        return df

    def compare_stocks(self, symbols: List[str], metrics: List[str]) -> pd.DataFrame:
        """
        Compare multiple stocks based on specified metrics.

        Args:
            symbols: List of stock symbols to compare
            metrics: List of metrics to compare

        Returns:
            DataFrame with comparison data
        """
        results = {}

        for symbol in symbols:
            # Get basic information
            info = self.data_explorer.company_overview(symbol=symbol)

            # Get ratios
            ratios = self.financial_ratios(symbol=symbol)

            # Combine data
            symbol_data = {}
            for metric in metrics:
                if metric in info.columns:
                    symbol_data[metric] = info[metric].iloc[0]
                elif metric in ratios.columns:
                    symbol_data[metric] = ratios[metric].iloc[0]
                else:
                    symbol_data[metric] = None

            results[symbol] = symbol_data

        # Convert to DataFrame
        return pd.DataFrame(results).T
```

## TypeScript Implementation

For the TypeScript implementation, we propose a more structured approach that centralizes analysis functionality in a single module. This approach follows the pattern outlined in the VCI Analysis documentation and extends it to support various data sources.

```typescript
import axios from 'axios';
import { getHeaders } from '../core/utils/client';
import { getLogger } from '../core/utils/logger';
import { DataExplorer } from '../common/data/data_explorer';

const logger = getLogger('analysis');

/**
 * Options for creating an Analysis instance
 */
export interface AnalysisOptions {
  source?: string;
  showLog?: boolean;
}

/**
 * Class providing analysis functionality for financial data
 */
export class Analysis {
  private source: string;
  private dataExplorer: DataExplorer;
  private showLog: boolean;

  /**
   * Create an Analysis instance
   *
   * @param options - Configuration options
   */
  constructor(options: AnalysisOptions = {}) {
    const { source = 'TCBS', showLog = false } = options;

    this.source = source;
    this.dataExplorer = new DataExplorer({ source });
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel('error');
    }
  }

  /**
   * Get analyst reports for a symbol
   *
   * @param symbol - The stock symbol
   * @returns Array of analyst reports
   */
  public async reports(symbol: string): Promise<any[]> {
    try {
      // This is a wrapper around the source-specific implementation
      const company = await this.dataExplorer.company({ symbol });

      if (company && typeof company.reports === 'function') {
        return await company.reports();
      } else {
        logger.error(`Source ${this.source} does not support reports`);
        return [];
      }
    } catch (error) {
      logger.error(`Error retrieving analyst reports: ${error.message}`);
      return [];
    }
  }

  /**
   * Get financial ratios for a symbol
   *
   * @param options - Options for retrieving financial ratios
   * @returns Financial ratios data
   */
  public async financialRatios(options: {
    symbol: string;
    period?: string;
    lang?: string;
    dropna?: boolean;
  }): Promise<any> {
    const { symbol, period = 'quarter', lang = 'en', dropna = true } = options;

    try {
      return await this.dataExplorer.ratio({
        symbol,
        period,
        lang,
        dropna,
      });
    } catch (error) {
      logger.error(`Error retrieving financial ratios: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate technical indicators for a symbol
   *
   * @param options - Options for calculating technical indicators
   * @returns Price data with indicators
   */
  public async technicalIndicators(options: {
    symbol: string;
    indicators: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { symbol, indicators, startDate, endDate } = options;

    try {
      // Get historical price data
      const prices = await this.dataExplorer.trading.history({
        symbol,
        startDate,
        endDate,
      });

      if (!prices || prices.length === 0) {
        return [];
      }

      // Calculate indicators
      let result = [...prices];

      for (const indicator of indicators) {
        switch (indicator.toUpperCase()) {
          case 'RSI':
            result = this.calculateRSI(result);
            break;
          case 'MACD':
            result = this.calculateMACD(result);
            break;
          case 'BOLLINGER':
            result = this.calculateBollingerBands(result);
            break;
          // Add more indicators as needed
        }
      }

      return result;
    } catch (error) {
      logger.error(`Error calculating technical indicators: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate Relative Strength Index (RSI)
   *
   * @param data - Price data
   * @param period - RSI period (default: 14)
   * @param column - Column name for price data (default: 'close')
   * @returns Data with RSI column added
   */
  private calculateRSI(
    data: any[],
    period: number = 14,
    column: string = 'close'
  ): any[] {
    // Ensure we have the required column
    if (!data[0] || !(column in data[0])) {
      logger.error(`Column ${column} not found in data`);
      return data;
    }

    // Create a copy of the data
    const result = [...data];

    // Calculate price changes
    const deltas = [];
    for (let i = 1; i < result.length; i++) {
      deltas.push(result[i][column] - result[i - 1][column]);
    }

    // Separate gains and losses
    const gains = deltas.map((delta) => (delta > 0 ? delta : 0));
    const losses = deltas.map((delta) => (delta < 0 ? Math.abs(delta) : 0));

    // Calculate average gain and loss
    const avgGains = [];
    const avgLosses = [];

    // First average is a simple average
    avgGains.push(
      gains.slice(0, period).reduce((sum, val) => sum + val, 0) / period
    );
    avgLosses.push(
      losses.slice(0, period).reduce((sum, val) => sum + val, 0) / period
    );

    // Rest of averages are smoothed
    for (let i = period; i < deltas.length; i++) {
      const gain = gains[i];
      const loss = losses[i];

      const avgGain =
        (avgGains[avgGains.length - 1] * (period - 1) + gain) / period;
      const avgLoss =
        (avgLosses[avgLosses.length - 1] * (period - 1) + loss) / period;

      avgGains.push(avgGain);
      avgLosses.push(avgLoss);
    }

    // Calculate RS and RSI
    const rs = avgGains.map((gain, i) => gain / (avgLosses[i] || 0.0001));
    const rsi = rs.map((rs) => 100 - 100 / (1 + rs));

    // Add RSI to the result
    // First period values will be undefined
    for (let i = 0; i < period; i++) {
      result[i + 1].RSI = undefined;
    }

    // Add remaining RSI values
    for (let i = 0; i < rsi.length - period + 1; i++) {
      result[i + period].RSI = rsi[i];
    }

    return result;
  }

  /**
   * Calculate Moving Average Convergence Divergence (MACD)
   *
   * @param data - Price data
   * @param options - MACD calculation options
   * @returns Data with MACD columns added
   */
  private calculateMACD(
    data: any[],
    options: {
      column?: string;
      fastPeriod?: number;
      slowPeriod?: number;
      signalPeriod?: number;
    } = {}
  ): any[] {
    const {
      column = 'close',
      fastPeriod = 12,
      slowPeriod = 26,
      signalPeriod = 9,
    } = options;

    // Ensure we have the required column
    if (!data[0] || !(column in data[0])) {
      logger.error(`Column ${column} not found in data`);
      return data;
    }

    // Create a copy of the data
    const result = [...data];

    // Calculate EMAs
    const prices = result.map((item) => item[column]);
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    // Calculate MACD line
    const macdLine = [];
    for (let i = 0; i < prices.length; i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }

    // Calculate signal line (EMA of MACD line)
    const signalLine = this.calculateEMA(macdLine, signalPeriod);

    // Calculate histogram
    const histogram = macdLine.map((value, i) => value - signalLine[i]);

    // Add MACD values to the result
    for (let i = 0; i < result.length; i++) {
      result[i].MACD = macdLine[i];
      result[i].MACD_Signal = signalLine[i];
      result[i].MACD_Histogram = histogram[i];
    }

    return result;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   *
   * @param data - Array of values
   * @param period - EMA period
   * @returns Array of EMA values
   */
  private calculateEMA(data: number[], period: number): number[] {
    const ema = [];
    const multiplier = 2 / (period + 1);

    // Start with SMA for the first EMA value
    const sma =
      data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    ema.push(sma);

    // Calculate rest of EMA values
    for (let i = period; i < data.length; i++) {
      ema.push(
        (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]
      );
    }

    // Fill the beginning with undefined values
    const result = new Array(data.length).fill(undefined);
    for (let i = 0; i < ema.length; i++) {
      result[i + period - 1] = ema[i];
    }

    return result;
  }

  /**
   * Calculate Bollinger Bands
   *
   * @param data - Price data
   * @param options - Bollinger Bands calculation options
   * @returns Data with Bollinger Bands columns added
   */
  private calculateBollingerBands(
    data: any[],
    options: {
      column?: string;
      period?: number;
      stdDev?: number;
    } = {}
  ): any[] {
    const { column = 'close', period = 20, stdDev = 2.0 } = options;

    // Ensure we have the required column
    if (!data[0] || !(column in data[0])) {
      logger.error(`Column ${column} not found in data`);
      return data;
    }

    // Create a copy of the data
    const result = [...data];

    // Extract prices
    const prices = result.map((item) => item[column]);

    // Calculate middle band (SMA)
    const middleBand = this.calculateSMA(prices, period);

    // Calculate standard deviation
    const standardDeviation = [];
    for (let i = 0; i < prices.length - period + 1; i++) {
      const slice = prices.slice(i, i + period);
      const mean = slice.reduce((sum, val) => sum + val, 0) / period;
      const squaredDiffs = slice.map((val) => (val - mean) ** 2);
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
      standardDeviation.push(Math.sqrt(variance));
    }

    // Calculate upper and lower bands
    const upperBand = middleBand.map((value, i) =>
      value !== undefined ? value + standardDeviation[i] * stdDev : undefined
    );
    const lowerBand = middleBand.map((value, i) =>
      value !== undefined ? value - standardDeviation[i] * stdDev : undefined
    );

    // Add Bollinger Bands to the result
    for (let i = 0; i < result.length; i++) {
      result[i].BB_Middle = middleBand[i];
      result[i].BB_Upper = upperBand[i];
      result[i].BB_Lower = lowerBand[i];
    }

    return result;
  }

  /**
   * Calculate Simple Moving Average (SMA)
   *
   * @param data - Array of values
   * @param period - SMA period
   * @returns Array of SMA values
   */
  private calculateSMA(data: number[], period: number): number[] {
    const result = new Array(data.length).fill(undefined);

    for (let i = 0; i <= data.length - period; i++) {
      const slice = data.slice(i, i + period);
      const sum = slice.reduce((sum, val) => sum + val, 0);
      result[i + period - 1] = sum / period;
    }

    return result;
  }

  /**
   * Compare multiple stocks based on specified metrics
   *
   * @param options - Options for comparing stocks
   * @returns Comparison data
   */
  public async compareStocks(options: {
    symbols: string[];
    metrics: string[];
  }): Promise<any> {
    const { symbols, metrics } = options;
    const results: Record<string, Record<string, any>> = {};

    for (const symbol of symbols) {
      try {
        // Get basic information
        const info = await this.dataExplorer.companyOverview({ symbol });

        // Get ratios
        const ratios = await this.financialRatios({ symbol });

        // Combine data
        const symbolData: Record<string, any> = {};
        for (const metric of metrics) {
          if (info && info[0] && metric in info[0]) {
            symbolData[metric] = info[0][metric];
          } else if (ratios && ratios[0] && metric in ratios[0]) {
            symbolData[metric] = ratios[0][metric];
          } else {
            symbolData[metric] = null;
          }
        }

        results[symbol] = symbolData;
      } catch (error) {
        logger.error(`Error processing data for ${symbol}: ${error.message}`);
        results[symbol] = metrics.reduce((obj, metric) => {
          obj[metric] = null;
          return obj;
        }, {} as Record<string, any>);
      }
    }

    // Convert to array of objects with symbol field
    return Object.entries(results).map(([symbol, data]) => ({
      symbol,
      ...data,
    }));
  }
}
```

## Usage Examples

### Python Examples

#### Basic Analysis

```python
from vnstock import Analysis

# Create an analysis instance
analysis = Analysis(source="TCBS")

# Get analyst reports
reports = analysis.reports(symbol="VNM")
print(f"Found {len(reports)} analyst reports")

# Get financial ratios
ratios = analysis.financial_ratios(symbol="VNM", period="annual")
print(ratios.head())

# Calculate technical indicators
data = analysis.technical_indicators(
    symbol="VNM",
    indicators=["RSI", "MACD", "BOLLINGER"],
    start_date="2023-01-01",
    end_date="2023-12-31"
)
print(data.tail())
```

#### Stock Comparison

```python
from vnstock import Analysis

# Create an analysis instance
analysis = Analysis(source="TCBS")

# Compare stocks
comparison = analysis.compare_stocks(
    symbols=["VNM", "MSN", "VIC"],
    metrics=["pe", "pb", "roe", "roa", "eps"]
)
print(comparison)
```

### TypeScript Examples

#### Basic Analysis

```typescript
import { Analysis } from 'vnstock-ts';

async function analyzeStock() {
  // Create an analysis instance
  const analysis = new Analysis({ source: 'TCBS' });

  // Get analyst reports
  const reports = await analysis.reports('VNM');
  console.log(`Found ${reports.length} analyst reports`);

  // Get financial ratios
  const ratios = await analysis.financialRatios({
    symbol: 'VNM',
    period: 'annual',
  });
  console.log(ratios);

  // Calculate technical indicators
  const data = await analysis.technicalIndicators({
    symbol: 'VNM',
    indicators: ['RSI', 'MACD', 'BOLLINGER'],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  });
  console.log(data.slice(-5)); // Last 5 entries
}

analyzeStock();
```

#### Stock Comparison

```typescript
import { Analysis } from 'vnstock-ts';

async function compareStocks() {
  // Create an analysis instance
  const analysis = new Analysis({ source: 'TCBS' });

  // Compare stocks
  const comparison = await analysis.compareStocks({
    symbols: ['VNM', 'MSN', 'VIC'],
    metrics: ['pe', 'pb', 'roe', 'roa', 'eps'],
  });

  console.table(comparison);
}

compareStocks();
```

## Implementation Details

### Technical Indicators

The implementation supports the following technical indicators:

1. **RSI (Relative Strength Index)**: A momentum oscillator that measures the speed and change of price movements. It ranges from 0 to 100 and is typically used to identify overbought or oversold conditions.

2. **MACD (Moving Average Convergence Divergence)**: A trend-following momentum indicator that shows the relationship between two moving averages of a security's price. It consists of the MACD line, signal line, and histogram.

3. **Bollinger Bands**: A volatility indicator consisting of a middle band (SMA) and two outer bands at a standard deviation distance above and below the middle band.

### Data Flow

1. User creates an `Analysis` instance with a preferred data source
2. The instance fetches data through the `DataExplorer` interface
3. Raw data is processed and transformed as needed
4. Technical indicators are calculated using the appropriate algorithms
5. Results are returned in a consistent format

### Dependencies

#### Python Dependencies

- `pandas`: For data manipulation
- `numpy`: For numerical operations
- Core `vnstock` utilities for API access and data transformation

#### TypeScript Dependencies

- `axios`: For making HTTP requests
- Core `vnstock-ts` utilities for API access and data transformation

## Implementation Notes

1. **Modular Design**: The implementation follows a modular design pattern, allowing for easy extension and maintenance.

2. **Data Source Abstraction**: The analysis module works with multiple data sources through the `DataExplorer` interface.

3. **Indicator Calculation**: Technical indicators are calculated using standard formulas rather than relying on external libraries, providing better control and understanding of the implementation.

4. **Error Handling**: Both implementations include comprehensive error handling to ensure robustness when working with external data sources.

5. **Future Extensions**: The architecture allows for easy addition of new technical indicators and analysis methods.

6. **Performance Considerations**: For large datasets, consider implementing more optimized algorithms or leveraging specialized libraries for technical analysis calculations.

7. **Extensibility**: The module can be extended to include more advanced analysis techniques like:
   - Pattern recognition
   - Signal generation
   - Backtesting capabilities
   - Portfolio optimization
