# Chart Wrapper Module

## Overview

The Chart Wrapper module provides a flexible abstraction layer for creating financial charts and visualizations in the `vnstock` package. It implements a consistent charting API that can work with different backend visualization libraries while providing specialized financial chart types like candlestick charts, OHLC (Open-High-Low-Close) charts, and technical indicators.

## Purpose

The Chart Wrapper module serves several key purposes:

1. Providing a unified interface for creating different types of financial charts
2. Supporting technical analysis with built-in indicators (moving averages, MACD, RSI, etc.)
3. Enabling interactive features essential for financial analysis (zoom, pan, crosshairs)
4. Facilitating comparison of multiple securities or indicators on the same chart
5. Supporting annotations and drawing tools for technical analysis
6. Abstracting away the details of the underlying charting library

## Core Components

### Chart Class

The main `Chart` class provides a high-level interface for creating various types of charts:

```typescript
export class Chart {
  private data: any;
  private options: ChartOptions;
  private renderer: ChartRenderer;

  constructor(data: any, options?: Partial<ChartOptions>) {
    this.data = data;
    this.options = {
      width: 800,
      height: 600,
      title: '',
      xAxis: { title: '' },
      yAxis: { title: '' },
      theme: 'light',
      interactive: true,
      renderer: 'canvas',
      ...options,
    };

    this.renderer = this.createRenderer();
  }

  /**
   * Create a line chart
   */
  line(options?: LineChartOptions): this {
    // Implementation details
    return this;
  }

  /**
   * Create a bar chart
   */
  bar(options?: BarChartOptions): this {
    // Implementation details
    return this;
  }

  /**
   * Create a candlestick chart for OHLC data
   */
  candlestick(options?: CandlestickOptions): this {
    // Implementation details
    return this;
  }

  /**
   * Add a technical indicator to the chart
   */
  indicator(type: IndicatorType, options?: IndicatorOptions): this {
    // Implementation details
    return this;
  }

  /**
   * Add a horizontal or vertical line to the chart
   */
  addLine(options: LineOptions): this {
    // Implementation details
    return this;
  }

  /**
   * Add annotations to the chart
   */
  annotate(options: AnnotationOptions): this {
    // Implementation details
    return this;
  }

  /**
   * Render the chart to the DOM or return as an image
   */
  render(container: string | HTMLElement): void {
    // Implementation details
  }

  /**
   * Export the chart as an image or SVG
   */
  export(format: 'png' | 'jpg' | 'svg', options?: ExportOptions): string {
    // Implementation details
    return '';
  }

  /**
   * Create the appropriate renderer based on options
   */
  private createRenderer(): ChartRenderer {
    // Implementation details
    return new CanvasRenderer();
  }
}
```

### Chart Options

The chart configuration options interface:

```typescript
export interface ChartOptions {
  // Basic chart dimensions and appearance
  width: number;
  height: number;
  title: string;
  subtitle?: string;
  theme: 'light' | 'dark' | 'custom';

  // Axis configuration
  xAxis: AxisOptions;
  yAxis: AxisOptions;

  // Interaction options
  interactive: boolean;
  zoomEnabled?: boolean;
  panEnabled?: boolean;
  tooltips?: boolean;
  crosshair?: boolean;

  // Rendering options
  renderer: 'canvas' | 'svg';

  // Legend options
  legend?: LegendOptions;

  // Margin and padding
  margin?: Margin;
  padding?: Padding;

  // Custom theme options
  customTheme?: ThemeOptions;
}

export interface AxisOptions {
  title: string;
  visible?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  tickCount?: number;
  tickFormat?: (value: any) => string;
  gridLines?: boolean;
  range?: [number, number];
  logarithmic?: boolean;
}

export interface LegendOptions {
  visible: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  alignment?: 'start' | 'center' | 'end';
  interactive?: boolean;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ThemeOptions {
  backgroundColor: string;
  textColor: string;
  axisColor: string;
  gridColor: string;
  colors: string[];
}
```

### Chart Renderers

Chart renderers provide implementation for different rendering technologies:

```typescript
export interface ChartRenderer {
  initialize(container: string | HTMLElement, options: ChartOptions): void;
  drawLine(data: any[], options: LineChartOptions): void;
  drawBar(data: any[], options: BarChartOptions): void;
  drawCandlestick(data: any[], options: CandlestickOptions): void;
  drawIndicator(
    type: IndicatorType,
    data: any[],
    options: IndicatorOptions
  ): void;
  drawAnnotation(annotations: AnnotationOptions[]): void;
  clear(): void;
  resize(width: number, height: number): void;
  export(format: string, options?: ExportOptions): string;
}

export class CanvasRenderer implements ChartRenderer {
  // Implementation details
}

export class SvgRenderer implements ChartRenderer {
  // Implementation details
}
```

## Financial Chart Types

### Candlestick Chart

Options for candlestick charts:

```typescript
export interface CandlestickOptions {
  upColor: string;
  downColor: string;
  borderUpColor?: string;
  borderDownColor?: string;
  wickUpColor?: string;
  wickDownColor?: string;
  wickWidth?: number;
  candleWidth?: number | 'auto';
  hollowCandles?: boolean;
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: Date) => string;
  showVolume?: boolean;
  volumeHeight?: number;
  volumeColor?: string | ((value: number, index: number) => string);
}
```

Example usage:

```typescript
import { Chart } from 'vnstock';

// OHLC data for the chart
const data = [
  {
    date: new Date('2023-01-01'),
    open: 150,
    high: 155,
    low: 145,
    close: 152,
    volume: 10000,
  },
  {
    date: new Date('2023-01-02'),
    open: 152,
    high: 160,
    low: 150,
    close: 157,
    volume: 12000,
  },
  // More data points...
];

// Create a candlestick chart
const chart = new Chart(data, {
  width: 1000,
  height: 600,
  title: 'AAPL Stock Price',
  xAxis: { title: 'Date' },
  yAxis: { title: 'Price ($)' },
}).candlestick({
  upColor: '#26a69a',
  downColor: '#ef5350',
  showVolume: true,
  volumeHeight: 100,
});

// Add a 20-day moving average
chart.indicator('sma', {
  period: 20,
  field: 'close',
  color: 'blue',
  lineWidth: 2,
});

// Add a 50-day moving average
chart.indicator('sma', {
  period: 50,
  field: 'close',
  color: 'red',
  lineWidth: 2,
});

// Render the chart to a DOM element
chart.render('chart-container');
```

### OHLC Chart

Options for OHLC charts:

```typescript
export interface OhlcOptions {
  upColor: string;
  downColor: string;
  tickWidth?: number;
  barWidth?: number | 'auto';
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: Date) => string;
  showVolume?: boolean;
  volumeHeight?: number;
  volumeColor?: string | ((value: number, index: number) => string);
}
```

Example usage:

```typescript
// Create an OHLC chart (price bars)
const chart = new Chart(data, {
  width: 1000,
  height: 600,
}).ohlc({
  upColor: 'green',
  downColor: 'red',
  tickWidth: 8,
});

// Render to DOM
chart.render('chart-container');
```

## Technical Indicators

The Chart Wrapper supports various technical indicators:

```typescript
export type IndicatorType =
  | 'sma'
  | 'ema'
  | 'wma'
  | 'macd'
  | 'rsi'
  | 'stochastic'
  | 'bollinger'
  | 'atr'
  | 'adx'
  | 'obv'
  | 'volume'
  | 'custom';

export interface IndicatorOptions {
  // Common options
  period: number;
  field?:
    | 'open'
    | 'high'
    | 'low'
    | 'close'
    | 'volume'
    | 'hl2'
    | 'hlc3'
    | 'ohlc4';
  color?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';

  // Specific options for certain indicators
  shortPeriod?: number; // For MACD
  longPeriod?: number; // For MACD
  signalPeriod?: number; // For MACD
  overbought?: number; // For RSI
  oversold?: number; // For RSI
  standardDeviations?: number; // For Bollinger Bands
  kPeriod?: number; // For Stochastic
  dPeriod?: number; // For Stochastic

  // Display options
  overlay?: boolean; // Display on main chart or separate panel
  height?: number; // Height of the panel if not overlay
  position?: 'top' | 'bottom'; // Position of the panel if not overlay
  valueFormatter?: (value: number) => string;

  // For custom indicators
  calculate?: (data: any[]) => any[];
  render?: (ctx: any, data: any[], options: any) => void;
}
```

Example usage:

```typescript
// Add RSI indicator in a separate panel
chart.indicator('rsi', {
  period: 14,
  color: 'purple',
  overlay: false,
  height: 100,
  position: 'bottom',
  overbought: 70,
  oversold: 30,
});

// Add Bollinger Bands overlay
chart.indicator('bollinger', {
  period: 20,
  standardDeviations: 2,
  color: '#9c27b0',
  lineWidth: 1,
  overlay: true,
});
```

## Annotations and Drawing Tools

Options for annotations and drawing tools:

```typescript
export type AnnotationType =
  | 'text'
  | 'line'
  | 'horizontalLine'
  | 'verticalLine'
  | 'rectangle'
  | 'circle'
  | 'fibonacci'
  | 'arrow'
  | 'channel';

export interface AnnotationOptions {
  type: AnnotationType;

  // Coordinates (depend on the annotation type)
  points: [number, number][] | [Date, number][];

  // Styling
  color?: string;
  fillColor?: string;
  opacity?: number;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';

  // Text-specific options
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Interactivity
  draggable?: boolean;
  selectable?: boolean;

  // Tool-specific options
  fibLevels?: number[];
  arrowSize?: number;
  channelWidth?: number;
}
```

Example usage:

```typescript
// Add a horizontal line at a specific price
chart.annotate({
  type: 'horizontalLine',
  points: [[0, 155]], // y-coordinate represents the price
  color: 'red',
  lineWidth: 2,
  lineStyle: 'dashed',
});

// Add a text annotation
chart.annotate({
  type: 'text',
  points: [[new Date('2023-01-05'), 160]], // [date, price]
  text: 'Resistance Level',
  color: 'black',
  fontSize: 14,
});

// Add a Fibonacci retracement
chart.annotate({
  type: 'fibonacci',
  points: [
    [new Date('2023-01-01'), 145], // start point
    [new Date('2023-01-10'), 165], // end point
  ],
  color: '#5d4037',
  lineWidth: 1,
  fibLevels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
});
```

## Export Functionality

Options for exporting charts:

```typescript
export interface ExportOptions {
  fileName?: string;
  backgroundColor?: string;
  scale?: number;
  quality?: number;
}
```

Example usage:

```typescript
// Export as PNG
const pngData = chart.export('png', {
  fileName: 'stock-chart',
  scale: 2, // higher resolution
  backgroundColor: 'white',
});

// Export as SVG (for vector format)
const svgData = chart.export('svg', {
  fileName: 'stock-chart-vector',
});
```

## Multi-Chart Support

Creating multi-pane charts:

```typescript
// Create a multi-pane chart with price and volume
const chart = new Chart(data, {
  width: 1000,
  height: 800,
});

// Main price chart
chart.candlestick({
  upColor: 'green',
  downColor: 'red',
  showVolume: false, // We'll show volume in a separate pane
});

// Add volume in a separate pane
chart.indicator('volume', {
  overlay: false,
  height: 150,
  position: 'bottom',
  color: '#7e57c2',
});

// Add RSI below volume
chart.indicator('rsi', {
  period: 14,
  overlay: false,
  height: 100,
  position: 'bottom',
  color: '#ff9800',
});

// Render the complete multi-pane chart
chart.render('chart-container');
```

## Implementation Notes

For the TypeScript implementation:

1. **Modular Design**: The Chart Wrapper should be implemented with a modular design, allowing for easy extension with new chart types, indicators, and renderers.

2. **Rendering Technology**: Consider using Canvas for performance with large datasets and SVG for better quality on exports and when working with smaller datasets. Provide options for both.

3. **Dependencies**: While the wrapper can be implemented from scratch, consider leveraging existing libraries as renderers:

   - For Canvas: `lightweight-charts` or `chartjs-chart-financial`
   - For SVG: `d3.js` or `highcharts`

4. **Performance Optimization**: Implement data chunking and throttling to handle large datasets without UI freezes.

5. **Responsive Design**: Ensure charts resize properly when the browser window changes size.

6. **Accessibility**: Add ARIA attributes and keyboard navigation for better accessibility.

7. **Documentation**: Provide comprehensive documentation with examples for each chart type and indicator.

## Integration with Data Module

The Chart Wrapper integrates with the Data modules:

```typescript
import { Chart } from 'vnstock/common/plot';
import { StockData } from 'vnstock/common/data';

// Get data using the StockData class
const stockData = new StockData();
const ohlcData = await stockData.getHistoricalPrices('AAPL', '1y', 'daily');

// Create chart directly from the data
const chart = new Chart(ohlcData)
  .candlestick({ upColor: 'green', downColor: 'red' })
  .indicator('sma', { period: 20, color: 'blue' })
  .indicator('sma', { period: 50, color: 'red' });

chart.render('chart-container');
```

## Related Documentation

- [Plot Module Overview](./index.md)
- [Data Explorer Module](../data/data_explorer.md)
