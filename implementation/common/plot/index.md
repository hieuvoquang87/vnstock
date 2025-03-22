# Plot Module

**Original Python Implementation**: [__init__.py](/vnstock/common/plot/__init__.py)


## Overview

The Plot module provides charting and visualization capabilities for the vnstock TypeScript library. It enables users to create various types of financial charts and data visualizations, making complex financial data more understandable and actionable. This module serves as a foundation for all visualization features in the library.

## Purpose

The Plot module serves several key purposes:

1. Creating visualizations of financial data with minimal code
2. Supporting various chart types, including line, bar, candlestick, and OHLC charts
3. Providing customization options for chart appearance and behavior
4. Enabling data visualization for both analysis and presentation purposes
5. Abstracting away the complexities of underlying charting libraries

## Module Structure

The Plot module consists of the following components:

| Component      | Description                                                                         |
| -------------- | ----------------------------------------------------------------------------------- |
| `ChartWrapper` | Core class that provides a unified interface for creating and managing charts       |
| `Renderers`    | Components that handle the actual rendering of charts using different technologies  |
| `ChartTypes`   | Implementations of different chart types (line, bar, candlestick, etc.)             |
| `Indicators`   | Technical indicators that can be added to charts (moving averages, MACD, RSI, etc.) |
| `Annotations`  | Tools for adding annotations and drawings to charts                                 |
| `Utilities`    | Helper functions for data formatting, color manipulation, and other common tasks    |

## Key Features

The Plot module offers several key features:

1. **Unified API**: Consistent API across different chart types and visualization needs
2. **Multiple Renderers**: Support for both Canvas and SVG rendering for different use cases
3. **Responsive Design**: Charts that automatically adapt to container size changes
4. **Interaction Support**: Built-in support for user interactions like zooming, panning, and tooltips
5. **Theme Support**: Light and dark themes, plus customization options
6. **Export Capabilities**: Ability to export charts as images or vector graphics
7. **Accessibility**: Support for keyboard navigation and screen readers

## Core Classes

### Chart

The main `Chart` class is the entry point for creating visualizations:

```typescript
import { Chart } from 'vnstock/common/plot';

// Create a chart with data
const chart = new Chart(data, {
  width: 800,
  height: 400,
  title: 'Stock Price',
});

// Choose chart type and render
chart.line().render('chart-container');
```

### ChartOptions

The `ChartOptions` interface defines customization options for charts:

```typescript
export interface ChartOptions {
  width: number;
  height: number;
  title: string;
  subtitle?: string;
  theme: 'light' | 'dark' | 'custom';
  xAxis: AxisOptions;
  yAxis: AxisOptions;
  // Additional options...
}
```

## Usage Examples

### Basic Line Chart

```typescript
import { Chart } from 'vnstock/common/plot';

const data = [
  { date: '2023-01-01', value: 100 },
  { date: '2023-01-02', value: 110 },
  { date: '2023-01-03', value: 105 },
  // More data points...
];

const chart = new Chart(data, {
  width: 800,
  height: 400,
  title: 'Stock Price',
  xAxis: { title: 'Date' },
  yAxis: { title: 'Price' },
}).line({
  color: 'blue',
  marker: true,
});

chart.render('chart-container');
```

### Multi-Series Chart

```typescript
import { Chart } from 'vnstock/common/plot';

const data = [
  { date: '2023-01-01', stock1: 100, stock2: 120 },
  { date: '2023-01-02', stock1: 110, stock2: 125 },
  { date: '2023-01-03', stock1: 105, stock2: 115 },
  // More data points...
];

const chart = new Chart(data, {
  width: 800,
  height: 400,
  title: 'Stock Comparison',
  xAxis: { title: 'Date' },
  yAxis: { title: 'Price' },
});

// Add multiple series
chart.line({
  dataKey: 'stock1',
  name: 'AAPL',
  color: 'blue',
});

chart.line({
  dataKey: 'stock2',
  name: 'MSFT',
  color: 'green',
});

chart.render('chart-container');
```

## Implementation Notes

When implementing the Plot module:

1. **Library Choice**: Consider using established libraries like Chart.js, D3.js, or Lightweight Charts as rendering backends
2. **Abstraction Level**: Balance abstraction with flexibility to meet diverse visualization needs
3. **Performance**: Optimize for large datasets with techniques like data decimation and WebGL rendering when available
4. **Bundle Size**: Consider the impact on bundle size when selecting dependencies
5. **Testing**: Implement visual regression testing for chart components

## Related Documentation

- [Chart Wrapper](./chart_wrapper.md)
- [Data Explorer Module](../data/data_explorer.md)
