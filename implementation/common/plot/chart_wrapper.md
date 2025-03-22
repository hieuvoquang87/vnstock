# Implementation of Charts Module

## Overview

The Charts module builds upon the basic plotting functionality to provide specialized financial charts and visualizations for the `vnstock` package. While the `common/plot` module handles general-purpose charting, this module focuses on financial visualizations like candlestick charts, OHLC (Open-High-Low-Close) charts, technical indicators, and advanced interactive features needed for financial data analysis.

## Purpose

The Charts module serves several key purposes:

1. Providing specialized financial chart types not available in standard plotting libraries
2. Supporting technical analysis with built-in indicators (moving averages, MACD, RSI, etc.)
3. Enabling interactive features essential for financial analysis (zoom, pan, crosshairs)
4. Facilitating comparison of multiple securities or indicators on the same chart
5. Supporting annotations and drawing tools for technical analysis

## Python Implementation

In the Python implementation, the Charts module extends the `Chart` class from the `common/plot` module to provide financial-specific chart types:

```python
import pandas as pd
import numpy as np
from vnstock_ezchart.mplot import MPlot
from vnstock.common.plot.chart_wrapper import Chart
from vnstock.core.utils.logger import get_logger

logger = get_logger(__name__)

class FinancialChart(Chart):
    """
    Extension of the Chart class for financial visualizations.
    Provides methods for candlestick charts, OHLC charts, and technical indicators.
    """

    def __init__(self, data):
        """
        Initialize the FinancialChart instance with the provided data.

        Args:
            data (pd.DataFrame): Financial data to be visualized.
                The DataFrame should include OHLC data for candlestick and OHLC charts.
        """
        super().__init__(data)
        self._validate_financial_data()

    def _validate_financial_data(self):
        """
        Validate that the data contains the required columns for financial charts.
        For OHLC charts, the data should have 'open', 'high', 'low', and 'close' columns.
        Column names can be case-insensitive.
        """
        if isinstance(self.data, pd.DataFrame):
            # Check for OHLC columns (case-insensitive)
            cols = [col.lower() for col in self.data.columns]
            self.has_ohlc = all(col in cols for col in ['open', 'high', 'low', 'close'])

            if not self.has_ohlc:
                logger.warning("Data does not contain OHLC columns. Some chart types may not be available.")

    def candlestick(self, date_col=None, open_col='open', high_col='high',
                    low_col='low', close_col='close', volume_col=None, **kwargs):
        """
        Create a candlestick chart from OHLC data.

        Args:
            date_col (str, optional): Column name for the date values. If None, uses the index.
            open_col (str): Column name for the opening prices. Default is 'open'.
            high_col (str): Column name for the high prices. Default is 'high'.
            low_col (str): Column name for the low prices. Default is 'low'.
            close_col (str): Column name for the closing prices. Default is 'close'.
            volume_col (str, optional): Column name for volume data to show in a subplot.
            **kwargs: Additional arguments to pass to the plot function.

        Returns:
            Matplotlib figure and axes
        """
        if not self.has_ohlc:
            raise ValueError("Data must contain OHLC columns for candlestick chart")

        return self.chart.candlestick(
            self.data, date_col=date_col, open_col=open_col, high_col=high_col,
            low_col=low_col, close_col=close_col, volume_col=volume_col, **kwargs
        )

    def ohlc(self, date_col=None, open_col='open', high_col='high',
             low_col='low', close_col='close', volume_col=None, **kwargs):
        """
        Create an OHLC chart from OHLC data.

        Args:
            date_col (str, optional): Column name for the date values. If None, uses the index.
            open_col (str): Column name for the opening prices. Default is 'open'.
            high_col (str): Column name for the high prices. Default is 'high'.
            low_col (str): Column name for the low prices. Default is 'low'.
            close_col (str): Column name for the closing prices. Default is 'close'.
            volume_col (str, optional): Column name for volume data to show in a subplot.
            **kwargs: Additional arguments to pass to the plot function.

        Returns:
            Matplotlib figure and axes
        """
        if not self.has_ohlc:
            raise ValueError("Data must contain OHLC columns for OHLC chart")

        return self.chart.ohlc(
            self.data, date_col=date_col, open_col=open_col, high_col=high_col,
            low_col=low_col, close_col=close_col, volume_col=volume_col, **kwargs
        )

    def add_indicator(self, indicator, **kwargs):
        """
        Add a technical indicator to the chart.

        Args:
            indicator (str): Indicator type ('sma', 'ema', 'bollinger', 'macd', 'rsi', etc.)
            **kwargs: Parameters for the indicator (e.g., window=20 for SMA)

        Returns:
            Modified chart with the indicator added
        """
        return self.chart.add_indicator(indicator, self.data, **kwargs)

    def volume_profile(self, price_col='close', bins=50, **kwargs):
        """
        Create a volume profile chart that shows volume distribution by price level.

        Args:
            price_col (str): Column name for price data. Default is 'close'.
            bins (int): Number of price bins for the histogram. Default is 50.
            **kwargs: Additional arguments to pass to the plot function.

        Returns:
            Matplotlib figure and axes
        """
        if 'volume' not in [col.lower() for col in self.data.columns]:
            raise ValueError("Data must contain a 'volume' column for volume profile")

        return self.chart.volume_profile(self.data, price_col=price_col, bins=bins, **kwargs)

    def correlation_matrix(self, **kwargs):
        """
        Create a correlation matrix chart for multiple securities.

        Args:
            **kwargs: Additional arguments to pass to the plot function.

        Returns:
            Matplotlib figure and axes
        """
        return self.chart.correlation_matrix(self.data, **kwargs)

# Add the finance property to pandas DataFrame
def _add_finance_property(cls):
    """Add the finance property to pandas DataFrame class."""
    @property
    def finance(self):
        return FinancialChart(self)

    cls.finance = finance

_add_finance_property(pd.DataFrame)
```

## TypeScript Implementation

For the TypeScript implementation, we'll build a more comprehensive financial charting library using D3.js and additional specialized components for financial visualization.

```typescript
import * as d3 from 'd3';
import { BaseChart, ChartOptions } from '../common/plot';

/**
 * Interface for financial data point with OHLC values
 */
export interface OHLCData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  [key: string]: any; // For additional columns
}

/**
 * Interface for financial chart options
 */
export interface FinancialChartOptions extends ChartOptions {
  volumePanel?: boolean;
  volumeHeight?: number;
  crosshair?: boolean;
  priceFormat?: string;
  dateFormat?: string;
  zoomable?: boolean;
  showTooltip?: boolean;
  tooltipFormat?: (d: OHLCData) => string;
  indicators?: IndicatorOptions[];
}

/**
 * Interface for technical indicator options
 */
export interface IndicatorOptions {
  type: 'sma' | 'ema' | 'bollinger' | 'macd' | 'rsi' | 'atr' | 'custom';
  name?: string;
  params?: any;
  color?: string;
  opacity?: number;
  lineWidth?: number;
  panel?: 'main' | 'separate' | 'volume';
  height?: number;
  yAxis?: boolean;
  calculator?: (data: OHLCData[]) => any[];
}

/**
 * Base class for financial charts
 */
export class FinancialBaseChart extends BaseChart {
  protected data: OHLCData[];
  protected xScale: d3.ScaleTime<number, number>;
  protected yScale: d3.ScaleLinear<number, number>;
  protected options: FinancialChartOptions;
  protected volumeScale?: d3.ScaleLinear<number, number>;
  protected indicatorScales: Map<string, d3.ScaleLinear<number, number>> =
    new Map();
  protected chartPanels: d3.Selection<SVGGElement, unknown, null, undefined>[] =
    [];
  protected zoom?: d3.ZoomBehavior<Element, unknown>;

  constructor(
    selector: string,
    data: OHLCData[],
    options: FinancialChartOptions = {}
  ) {
    super(selector, options);
    this.data = data;
    this.options = {
      volumePanel: true,
      volumeHeight: 80,
      crosshair: true,
      priceFormat: ',.2f',
      dateFormat: '%Y-%m-%d',
      zoomable: true,
      showTooltip: true,
      ...this.options,
    } as FinancialChartOptions;

    // Create main chart area
    this.setupMainPanel();

    // Create volume panel if requested
    if (this.options.volumePanel) {
      this.setupVolumePanel();
    }

    // Create additional panels for indicators
    this.setupIndicatorPanels();

    // Create axes
    this.createScales();

    // Setup zoom functionality
    if (this.options.zoomable) {
      this.setupZoom();
    }

    // Setup crosshair
    if (this.options.crosshair) {
      this.setupCrosshair();
    }

    // Setup tooltip
    if (this.options.showTooltip) {
      this.setupTooltip();
    }
  }

  /**
   * Set up the main chart panel
   */
  protected setupMainPanel(): void {
    // Implementation details...
  }

  /**
   * Set up the volume panel
   */
  protected setupVolumePanel(): void {
    // Implementation details...
  }

  /**
   * Set up panels for technical indicators
   */
  protected setupIndicatorPanels(): void {
    // Implementation details...
  }

  /**
   * Create scales for price, time, volume, and indicators
   */
  protected createScales(): void {
    // Create time scale (x-axis)
    this.xScale = d3
      .scaleTime()
      .domain(d3.extent(this.data, (d) => d.date) as [Date, Date])
      .range([0, this.contentWidth]);

    // Create price scale (y-axis)
    const yDomain = this.calculateYDomain();
    this.yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([this.contentHeight, 0]);

    // Create volume scale if needed
    if (this.options.volumePanel) {
      const maxVolume = d3.max(this.data, (d) => d.volume) || 0;
      this.volumeScale = d3
        .scaleLinear()
        .domain([0, maxVolume])
        .range([this.options.volumeHeight!, 0]);
    }

    // Create scales for indicators
    if (this.options.indicators) {
      for (const indicator of this.options.indicators) {
        // Create scale based on indicator type and data
        // Implementation details...
      }
    }
  }

  /**
   * Calculate appropriate y-axis domain for the price data
   */
  protected calculateYDomain(): [number, number] {
    const maxHigh = d3.max(this.data, (d) => d.high) || 0;
    const minLow = d3.min(this.data, (d) => d.low) || 0;
    const padding = (maxHigh - minLow) * 0.05; // 5% padding
    return [minLow - padding, maxHigh + padding];
  }

  /**
   * Set up zoom functionality
   */
  protected setupZoom(): void {
    // Implementation details...
  }

  /**
   * Set up crosshair functionality
   */
  protected setupCrosshair(): void {
    // Implementation details...
  }

  /**
   * Set up tooltip functionality
   */
  protected setupTooltip(): void {
    // Implementation details...
  }

  /**
   * Update the chart (to be implemented by subclasses)
   */
  protected update(): void {
    // This method should be overridden by subclasses
  }
}

/**
 * Candlestick chart implementation
 */
export class CandlestickChart extends FinancialBaseChart {
  constructor(
    selector: string,
    data: OHLCData[],
    options: FinancialChartOptions = {}
  ) {
    super(selector, data, options);
    this.render();
  }

  /**
   * Render the candlestick chart
   */
  protected render(): void {
    // Draw candlesticks
    const candlesticks = this.chartPanels[0]
      .selectAll('g.candlestick')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'candlestick')
      .attr('transform', (d) => `translate(${this.xScale(d.date)}, 0)`);

    // Draw wicks (high-low lines)
    candlesticks
      .append('line')
      .attr('class', 'wick')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', (d) => this.yScale(d.high))
      .attr('y2', (d) => this.yScale(d.low))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    // Draw bodies (open-close rectangles)
    const candleWidth = Math.min(
      8,
      (this.contentWidth / this.data.length) * 0.8
    );

    candlesticks
      .append('rect')
      .attr('class', 'body')
      .attr('x', -candleWidth / 2)
      .attr('y', (d) => this.yScale(Math.max(d.open, d.close)))
      .attr('width', candleWidth)
      .attr('height', (d) =>
        Math.abs(this.yScale(d.open) - this.yScale(d.close))
      )
      .attr('fill', (d) => (d.close >= d.open ? 'green' : 'red'))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    // Draw volume bars if enabled
    if (this.options.volumePanel && this.volumeScale) {
      this.chartPanels[1]
        .selectAll('rect.volume')
        .data(this.data)
        .enter()
        .append('rect')
        .attr('class', 'volume')
        .attr('x', (d) => this.xScale(d.date) - candleWidth / 2)
        .attr('y', (d) => this.volumeScale!(d.volume || 0))
        .attr('width', candleWidth)
        .attr(
          'height',
          (d) => this.options.volumeHeight! - this.volumeScale!(d.volume || 0)
        )
        .attr('fill', (d) =>
          d.close >= d.open ? 'rgba(0,128,0,0.5)' : 'rgba(255,0,0,0.5)'
        );
    }

    // Draw technical indicators if configured
    if (this.options.indicators) {
      this.renderIndicators();
    }
  }

  /**
   * Render technical indicators on the chart
   */
  protected renderIndicators(): void {
    // Implementation details...
  }

  /**
   * Update the chart on resize or data change
   */
  protected update(): void {
    // Update scales
    this.xScale.range([0, this.contentWidth]);
    const yDomain = this.calculateYDomain();
    this.yScale.domain(yDomain).range([this.contentHeight, 0]);

    // Update all elements
    // Implementation details...
  }
}

/**
 * OHLC chart implementation
 */
export class OHLCChart extends FinancialBaseChart {
  // Similar to CandlestickChart but with OHLC bars instead of candles
  // Implementation details...
}

/**
 * Technical indicator calculations
 */
export class Indicators {
  /**
   * Calculate Simple Moving Average (SMA)
   */
  static sma(
    data: OHLCData[],
    period: number,
    field: keyof OHLCData = 'close'
  ): number[] {
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN); // Not enough data for first (period-1) points
        continue;
      }

      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j][field] as number;
      }
      result.push(sum / period);
    }

    return result;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  static ema(
    data: OHLCData[],
    period: number,
    field: keyof OHLCData = 'close'
  ): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);

    // Start with SMA for the first EMA value
    let ema = Indicators.sma(data.slice(0, period), period, field)[period - 1];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN); // Not enough data for first (period-1) points
        continue;
      }

      if (i === period - 1) {
        result.push(ema);
        continue;
      }

      // EMA = (Close - Previous EMA) * multiplier + Previous EMA
      ema = ((data[i][field] as number) - ema) * multiplier + ema;
      result.push(ema);
    }

    return result;
  }

  /**
   * Calculate Bollinger Bands
   */
  static bollinger(
    data: OHLCData[],
    period: number = 20,
    stdDev: number = 2,
    field: keyof OHLCData = 'close'
  ): {
    middle: number[];
    upper: number[];
    lower: number[];
  } {
    const middle = Indicators.sma(data, period, field);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
        continue;
      }

      // Calculate standard deviation
      let sumSquares = 0;
      for (let j = 0; j < period; j++) {
        const deviation = (data[i - j][field] as number) - middle[i];
        sumSquares += deviation * deviation;
      }
      const std = Math.sqrt(sumSquares / period);

      upper.push(middle[i] + stdDev * std);
      lower.push(middle[i] - stdDev * std);
    }

    return { middle, upper, lower };
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  static macd(
    data: OHLCData[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
    field: keyof OHLCData = 'close'
  ): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    // Implementation details...
    return { macd: [], signal: [], histogram: [] };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  static rsi(
    data: OHLCData[],
    period: number = 14,
    field: keyof OHLCData = 'close'
  ): number[] {
    // Implementation details...
    return [];
  }
}

/**
 * Main chart factory that provides methods to create different financial chart types
 */
export class FinancialCharts {
  /**
   * Create a candlestick chart
   */
  static candlestick(
    selector: string,
    data: OHLCData[],
    options: FinancialChartOptions = {}
  ): CandlestickChart {
    return new CandlestickChart(selector, data, options);
  }

  /**
   * Create an OHLC chart
   */
  static ohlc(
    selector: string,
    data: OHLCData[],
    options: FinancialChartOptions = {}
  ): OHLCChart {
    return new OHLCChart(selector, data, options);
  }

  /**
   * Calculate technical indicators without rendering them
   */
  static indicators = Indicators;
}
```

## Usage Examples

### Python Examples

#### Candlestick Chart with Volume

```python
import pandas as pd
from vnstock.explorer.tcbs.trading import history
from datetime import datetime

# Get historical data for VNM
end_date = datetime.now().strftime("%Y-%m-%d")
start_date = "2023-01-01"
data = history(symbol="VNM", start_date=start_date, end_date=end_date)

# Create a candlestick chart with volume
data.finance.candlestick(
    title="VNM Price History",
    volume_col="volume",
    figsize=(12, 8),
    style="yahoo",  # Financial chart style
    grid=True
)
```

#### Multiple Technical Indicators

```python
import pandas as pd
from vnstock.explorer.tcbs.trading import history
from datetime import datetime, timedelta

# Get historical data for VNM
end_date = datetime.now().strftime("%Y-%m-%d")
start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
data = history(symbol="VNM", start_date=start_date, end_date=end_date)

# Create a candlestick chart with multiple indicators
fig, ax = data.finance.candlestick(
    title="VNM with Technical Indicators",
    volume_col="volume",
    figsize=(14, 10),
)

# Add technical indicators
data.finance.add_indicator('sma', ax=ax, window=20, color='blue', label='SMA 20')
data.finance.add_indicator('sma', ax=ax, window=50, color='red', label='SMA 50')
data.finance.add_indicator('bollinger', ax=ax, window=20, std=2)
data.finance.add_indicator('rsi', window=14, figsize=(14, 3))  # Separate subplot for RSI
```

#### Comparison of Multiple Stocks

```python
import pandas as pd
from vnstock.explorer.tcbs.trading import history
from datetime import datetime, timedelta

# Get historical data for multiple stocks
symbols = ["VNM", "MSN", "VIC"]
end_date = datetime.now().strftime("%Y-%m-%d")
start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")

# Fetch data for each symbol and combine
data_frames = []
for symbol in symbols:
    df = history(symbol=symbol, start_date=start_date, end_date=end_date)
    df['symbol'] = symbol
    data_frames.append(df)

combined_data = pd.concat(data_frames)

# Create a comparison chart (normalized to starting price)
pivoted = combined_data.pivot(index='time', columns='symbol', values='close')
normalized = pivoted / pivoted.iloc[0] * 100

# Plot the comparison
normalized.viz.timeseries(
    title="Price Performance Comparison (Normalized)",
    figsize=(12, 6),
    grid=True,
    legend=True
)
```

### TypeScript Examples

#### Basic Candlestick Chart

```typescript
import { FinancialCharts } from 'vnstock-ts';
import { fetchHistoricalData } from 'vnstock-ts/api';

async function renderCandlestickChart() {
  // Get historical data for VNM
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  )
    .toISOString()
    .split('T')[0];

  const data = await fetchHistoricalData({
    symbol: 'VNM',
    startDate,
    endDate,
  });

  // Create a candlestick chart
  const chart = FinancialCharts.candlestick('#chart-container', data, {
    title: 'VNM Price History',
    volumePanel: true,
    crosshair: true,
    zoomable: true,
    theme: 'light',
  });
}

renderCandlestickChart();
```

#### Interactive Chart with Indicators

```typescript
import { FinancialCharts } from 'vnstock-ts';
import { fetchHistoricalData } from 'vnstock-ts/api';

async function renderChartWithIndicators() {
  // Get historical data
  const data = await fetchHistoricalData({
    symbol: 'VNM',
    startDate: '2023-01-01',
    endDate: new Date().toISOString().split('T')[0],
  });

  // Create a candlestick chart with indicators
  const chart = FinancialCharts.candlestick('#chart-container', data, {
    title: 'VNM with Technical Indicators',
    volumePanel: true,
    indicators: [
      { type: 'sma', params: { period: 20 }, color: 'blue', name: 'SMA 20' },
      { type: 'sma', params: { period: 50 }, color: 'red', name: 'SMA 50' },
      {
        type: 'bollinger',
        params: { period: 20, stdDev: 2 },
        color: 'purple',
      },
      {
        type: 'rsi',
        params: { period: 14 },
        panel: 'separate',
        height: 100,
      },
    ],
    theme: 'dark',
  });
}

renderChartWithIndicators();
```

#### Trading Dashboard

```typescript
import { FinancialCharts, Indicators } from 'vnstock-ts';
import { fetchHistoricalData, fetchCompanyInfo } from 'vnstock-ts/api';

async function createTradingDashboard() {
  // Get historical data
  const data = await fetchHistoricalData({
    symbol: 'VNM',
    startDate: '2023-01-01',
    endDate: new Date().toISOString().split('T')[0],
  });

  // Create price chart
  const priceChart = FinancialCharts.candlestick('#price-chart', data, {
    title: 'Price Chart',
    volumePanel: true,
    crosshair: true,
    indicators: [
      { type: 'sma', params: { period: 20 }, color: 'blue' },
      { type: 'sma', params: { period: 50 }, color: 'red' },
    ],
  });

  // Create indicator panel for MACD
  const macdData = Indicators.macd(data);
  // Render MACD chart in a separate container
  // Implementation details...

  // Create indicator panel for RSI
  const rsiData = Indicators.rsi(data);
  // Render RSI chart in a separate container
  // Implementation details...

  // Fetch and display company information
  const companyInfo = await fetchCompanyInfo('VNM');
  document.querySelector('#company-info').innerHTML = `
    <h3>${companyInfo.name}</h3>
    <p>Exchange: ${companyInfo.exchange}</p>
    <p>Industry: ${companyInfo.industry}</p>
    <p>Market Cap: ${companyInfo.marketCap.toLocaleString()} VND</p>
  `;

  // Add event listeners for interactive features
  // Implementation details...
}

createTradingDashboard();
```

## Implementation Details

### Chart Types

1. **Candlestick Chart**: Displays OHLC data with colored boxes (candles) that show the price range and direction of movement.

2. **OHLC Chart**: Similar to candlestick charts but using bars with tick marks for open and close prices.

3. **Line Chart**: Simple line charts for closing prices or other single values over time.

4. **Area Chart**: Line charts with the area below the line filled for visual emphasis.

5. **Volume Chart**: Bar charts showing trading volume, often included as a subplot.

6. **Correlation Chart**: Heat maps or scatter plots showing correlations between multiple securities.

### Technical Indicators

1. **Moving Averages**: Simple Moving Average (SMA), Exponential Moving Average (EMA), etc.

2. **Oscillators**: Relative Strength Index (RSI), Moving Average Convergence Divergence (MACD), Stochastic Oscillator, etc.

3. **Volatility Measures**: Bollinger Bands, Average True Range (ATR), etc.

4. **Trend Indicators**: Directional Movement Index (DMI), Average Directional Index (ADX), etc.

5. **Volume Indicators**: On-Balance Volume (OBV), Volume-Weighted Average Price (VWAP), etc.

### Interactive Features

1. **Zoom and Pan**: Allow users to zoom in/out and pan across the chart to focus on specific time periods.

2. **Crosshairs**: Display vertical and horizontal lines that follow the mouse cursor to help read precise values.

3. **Tooltips**: Show detailed information about a data point when hovering over it.

4. **Dynamic Timeframes**: Allow users to switch between different timeframes (daily, weekly, monthly, etc.).

5. **Drawing Tools**: Support for trend lines, Fibonacci retracements, and other technical analysis annotations.

### Dependencies

#### Python Dependencies

- `pandas`: For data manipulation
- `numpy`: For numerical operations
- `matplotlib`: For generating static charts
- `mplfinance`: For financial charts (candlestick, OHLC)
- `vnstock_ezchart`: For the charting library integration

#### TypeScript Dependencies

- `d3.js`: Core library for visualization
- `d3fc`: Financial components for D3
- Optional additional libraries:
  - `lightweight-charts`: Alternative trading chart library
  - `react` and `react-dom`: For React integration

## Implementation Notes

1. **Performance Optimization**: Financial charts often deal with large datasets, so performance optimization is important, especially for interactive features.

2. **Responsive Design**: Charts should adapt to different screen sizes and devices, maintaining usability across platforms.

3. **Accessibility**: Consider color blindness and other accessibility concerns when designing charts and color schemes.

4. **State Management**: For interactive charts, proper state management is essential to handle user interactions and updates.

5. **Data Loading**: Implement efficient data loading strategies, such as progressive loading or downsampling for large datasets.

6. **Data Formats**: Support various data formats and provide utilities for converting between them.

7. **Extensibility**: The architecture should be extensible to easily add new chart types or indicators in the future.

8. **Internationalization**: Consider internationalization for date formats, number formats, and other locale-specific elements.
