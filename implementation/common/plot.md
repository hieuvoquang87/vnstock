# Implementation of Plotting Functionality

## Overview

The plotting module provides a convenient interface for creating various types of visualizations from pandas DataFrames and Series in the Python implementation. It wraps around visualization libraries to provide a consistent API. For the TypeScript implementation, we'll use D3.js, a powerful library for creating interactive data visualizations in the browser.

## Purpose

Data visualization is a critical component of financial data analysis. This module serves several purposes:

1. Providing a unified interface for creating common chart types
2. Making it easy to visualize financial data with minimal code
3. Supporting various customization options for charts
4. Enabling interactive visualizations in web applications

## Python Implementation

In the Python implementation, the plotting functionality is implemented through a `Chart` wrapper class that integrates with the `vnstock_ezchart.mplot` library:

```python
import pandas as pd
from vnstock_ezchart.mplot import MPlot, Utils
from vnstock.core.utils.logger import get_logger

logger = get_logger(__name__)

class Chart:
    """
    A wrapper class for creating various types of charts using data from a pandas DataFrame or Series.
    """

    def __init__(self, data):
        """
        Initialize the Chart instance with the provided data.

        Args:
            data (pd.DataFrame or pd.Series): The data to be visualized.
        """
        self.data = data
        self.chart = MPlot()
        self.utils = Utils()
        self.validate_data()
        self._add_utils_methods()

    def validate_data(self):
        """
        Validate the input data to ensure it is a pandas DataFrame or Series.
        """
        if not isinstance(self.data, (pd.DataFrame, pd.Series)):
            raise ValueError("Data must be a pandas DataFrame or Series")
        # Ensure datetime index
        if isinstance(self.data.index, pd.DatetimeIndex):
            self.data.index = pd.to_datetime(self.data.index)

    def _add_utils_methods(self):
        """
        Dynamically add methods from the Utils class to the Chart instance.
        """
        for method_name in dir(self.utils):
            if not method_name.startswith("__"):
                method = getattr(self.utils, method_name)
                if callable(method):
                    setattr(self, method_name, method)

    # Chart methods for various plot types
    def bar(self, **kwargs):
        """Plot a bar chart."""
        return self.chart.bar(self.data, **kwargs)

    def hist(self, **kwargs):
        """Plot a histogram."""
        return self.chart.hist(self.data, **kwargs)

    def pie(self, labels=None, values=None, **kwargs):
        """Plot a pie chart."""
        # Implementation details...
        return self.chart.pie(data, labels, **kwargs)

    def timeseries(self, **kwargs):
        """Plot a time series chart."""
        return self.chart.timeseries(self.data, **kwargs)

    def heatmap(self, **kwargs):
        """Plot a heatmap."""
        return self.chart.heatmap(self.data, **kwargs)

    def scatter(self, x, y, **kwargs):
        """Plot a scatter chart."""
        return self.chart.scatter(self.data, x, y, **kwargs)

    def treemap(self, values, labels, **kwargs):
        """Plot a treemap chart."""
        # Implementation details...
        return self.chart.treemap(data, labels, **kwargs)

    def boxplot(self, **kwargs):
        """Plot a boxplot."""
        return self.chart.boxplot(self.data, **kwargs)

    def pairplot(self, **kwargs):
        """Plot a pairplot."""
        return self.chart.pairplot(self.data, **kwargs)

    def wordcloud(self, show_log=False, **kwargs):
        """Plot a word cloud."""
        # Implementation details...
        return self.chart.wordcloud(text, **kwargs)

    def table(self, **kwargs):
        """Plot a table."""
        return self.chart.table(self.data, **kwargs)

    def combo(self, bar_data, line_data, **kwargs):
        """Plot a combo chart with both bar and line data."""
        # Implementation details...
        return self.chart.combo_chart(bar_df, line_df, **kwargs)

# Add the viz property to pandas DataFrame and Series classes
def _add_viz_property(cls):
    """Add the viz property to pandas DataFrame and Series classes."""
    @property
    def viz(self):
        return Chart(self)
    cls.viz = viz

_add_viz_property(pd.DataFrame)
_add_viz_property(pd.Series)
```

This implementation adds a `viz` property to pandas DataFrame and Series objects, allowing users to create visualizations directly from their data.

## TypeScript Implementation with D3.js

For the TypeScript implementation, we'll use D3.js, a powerful library for creating interactive data visualizations in the browser. D3.js provides lower-level control over the visualization process, allowing for highly customized and interactive charts.

```typescript
import * as d3 from 'd3';

/**
 * Interface for chart options common to all chart types
 */
interface ChartOptions {
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  title?: string;
  xLabel?: string;
  yLabel?: string;
  colors?: string[];
  responsive?: boolean;
  tooltip?: boolean;
  animation?: boolean;
  animationDuration?: number;
  legend?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * Base chart class that provides common functionality for all chart types
 */
export class BaseChart {
  protected svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  protected width: number;
  protected height: number;
  protected margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  protected contentWidth: number;
  protected contentHeight: number;
  protected container: d3.Selection<HTMLElement, unknown, null, undefined>;
  protected options: ChartOptions;

  constructor(selector: string, options: ChartOptions = {}) {
    // Default options
    this.options = {
      width: 800,
      height: 500,
      margin: { top: 50, right: 30, bottom: 50, left: 60 },
      title: '',
      xLabel: '',
      yLabel: '',
      colors: d3.schemeCategory10,
      responsive: true,
      tooltip: true,
      animation: true,
      animationDuration: 1000,
      legend: true,
      theme: 'light',
      ...options,
    };

    // Set dimensions and margins
    this.width = this.options.width!;
    this.height = this.options.height!;
    this.margin = this.options.margin!;
    this.contentWidth = this.width - this.margin.left - this.margin.right;
    this.contentHeight = this.height - this.margin.top - this.margin.bottom;

    // Select container element
    this.container = d3.select(selector);

    // Create SVG element
    this.svg = this.container
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', `chart-svg ${this.options.theme}`);

    // Apply theme styling
    this.applyTheme();

    // Handle responsiveness
    if (this.options.responsive) {
      this.makeResponsive();
    }
  }

  /**
   * Apply theme-specific styling to the chart
   */
  protected applyTheme(): void {
    if (this.options.theme === 'dark') {
      this.svg.style('background-color', '#2d3035');
      this.svg.selectAll('text').style('fill', '#e8e9ed');
      this.svg.selectAll('line, path').style('stroke', '#555');
    } else {
      this.svg.style('background-color', '#ffffff');
      this.svg.selectAll('text').style('fill', '#333');
      this.svg.selectAll('line, path').style('stroke', '#ccc');
    }
  }

  /**
   * Make the chart responsive to container size changes
   */
  protected makeResponsive(): void {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;

          const newWidth = contentBoxSize.inlineSize;
          const newHeight = this.height * (newWidth / this.width);

          this.width = newWidth;
          this.contentWidth = this.width - this.margin.left - this.margin.right;
          this.height = newHeight;
          this.contentHeight =
            this.height - this.margin.top - this.margin.bottom;

          this.svg.attr('width', this.width).attr('height', this.height);

          this.update();
        }
      }
    });

    resizeObserver.observe(this.container.node()!);
  }

  /**
   * Update the chart (to be implemented by subclasses)
   */
  protected update(): void {
    // This method should be overridden by subclasses
  }

  /**
   * Add a title to the chart
   */
  protected addTitle(): void {
    if (this.options.title) {
      this.svg
        .append('text')
        .attr('x', this.width / 2)
        .attr('y', this.margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-title')
        .text(this.options.title);
    }
  }

  /**
   * Add axis labels to the chart
   */
  protected addAxisLabels(): void {
    // X-axis label
    if (this.options.xLabel) {
      this.svg
        .append('text')
        .attr('x', this.width / 2)
        .attr('y', this.height - 10)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label x-axis-label')
        .text(this.options.xLabel);
    }

    // Y-axis label
    if (this.options.yLabel) {
      this.svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(this.height / 2))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label y-axis-label')
        .text(this.options.yLabel);
    }
  }

  /**
   * Create a tooltip div if tooltips are enabled
   */
  protected createTooltip(): d3.Selection<
    HTMLDivElement,
    unknown,
    null,
    undefined
  > {
    return d3
      .select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'rgba(0, 0, 0, 0.7)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', '1000');
  }
}

/**
 * Interface for bar chart data
 */
interface BarChartData {
  key: string;
  value: number;
}

/**
 * Interface for bar chart options
 */
interface BarChartOptions extends ChartOptions {
  horizontal?: boolean;
  barPadding?: number;
  valueLabels?: boolean;
}

/**
 * Bar chart implementation using D3.js
 */
export class BarChart extends BaseChart {
  private data: BarChartData[];
  private xScale: d3.ScaleBand<string>;
  private yScale: d3.ScaleLinear<number, number>;
  private options: BarChartOptions;

  constructor(
    selector: string,
    data: BarChartData[],
    options: BarChartOptions = {}
  ) {
    super(selector, options);
    this.data = data;
    this.options = {
      horizontal: false,
      barPadding: 0.1,
      valueLabels: false,
      ...this.options,
    } as BarChartOptions;

    // Create scales
    this.xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.key))
      .range([0, this.contentWidth])
      .padding(this.options.barPadding!);

    const maxValue = d3.max(data, (d) => d.value) || 0;
    this.yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding at the top
      .range([this.contentHeight, 0]);

    this.render();
  }

  /**
   * Render the bar chart
   */
  private render(): void {
    // Create chart group
    const chartGroup = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // Add X and Y axes
    const xAxis = d3.axisBottom(this.xScale);
    const yAxis = d3.axisLeft(this.yScale);

    chartGroup
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.contentHeight})`)
      .call(xAxis);

    chartGroup.append('g').attr('class', 'y-axis').call(yAxis);

    // Create tooltip
    let tooltip;
    if (this.options.tooltip) {
      tooltip = this.createTooltip();
    }

    // Add bars
    const bars = chartGroup
      .selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => this.xScale(d.key)!)
      .attr('width', this.xScale.bandwidth())
      .attr('y', this.contentHeight)
      .attr('height', 0)
      .attr(
        'fill',
        (d, i) => this.options.colors![i % this.options.colors!.length]
      );

    // Add animation if enabled
    if (this.options.animation) {
      bars
        .transition()
        .duration(this.options.animationDuration!)
        .attr('y', (d) => this.yScale(d.value))
        .attr('height', (d) => this.contentHeight - this.yScale(d.value));
    } else {
      bars
        .attr('y', (d) => this.yScale(d.value))
        .attr('height', (d) => this.contentHeight - this.yScale(d.value));
    }

    // Add tooltip events
    if (this.options.tooltip) {
      bars
        .on('mouseover', (event, d) => {
          tooltip!.transition().duration(200).style('opacity', 0.9);
          tooltip!
            .html(`${d.key}: ${d.value}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', () => {
          tooltip!.transition().duration(500).style('opacity', 0);
        });
    }

    // Add value labels if enabled
    if (this.options.valueLabels) {
      chartGroup
        .selectAll('.value-label')
        .data(this.data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d) => this.xScale(d.key)! + this.xScale.bandwidth() / 2)
        .attr('y', (d) => this.yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .text((d) => d.value);
    }

    // Add title and axis labels
    this.addTitle();
    this.addAxisLabels();
  }

  /**
   * Update the chart when data or options change
   */
  protected update(): void {
    // Update scales
    this.xScale.range([0, this.contentWidth]);
    this.yScale.range([this.contentHeight, 0]);

    // Update axes
    this.svg
      .select('.x-axis')
      .attr('transform', `translate(0, ${this.contentHeight})`)
      .call(d3.axisBottom(this.xScale));

    this.svg.select('.y-axis').call(d3.axisLeft(this.yScale));

    // Update bars
    this.svg
      .selectAll('.bar')
      .attr('x', (d) => this.xScale(d.key)!)
      .attr('width', this.xScale.bandwidth())
      .attr('y', (d) => this.yScale(d.value))
      .attr('height', (d) => this.contentHeight - this.yScale(d.value));

    // Update value labels if present
    this.svg
      .selectAll('.value-label')
      .attr('x', (d) => this.xScale(d.key)! + this.xScale.bandwidth() / 2)
      .attr('y', (d) => this.yScale(d.value) - 5);
  }
}

/**
 * Interface for time series data
 */
interface TimeSeriesData {
  date: Date;
  value: number;
}

/**
 * Interface for time series chart options
 */
interface TimeSeriesChartOptions extends ChartOptions {
  area?: boolean;
  curve?: 'linear' | 'basis' | 'cardinal' | 'step';
  dotSize?: number;
  showDots?: boolean;
}

/**
 * Time series chart implementation using D3.js
 */
export class TimeSeriesChart extends BaseChart {
  private data: TimeSeriesData[];
  private xScale: d3.ScaleTime<number, number>;
  private yScale: d3.ScaleLinear<number, number>;
  private options: TimeSeriesChartOptions;

  constructor(
    selector: string,
    data: TimeSeriesData[],
    options: TimeSeriesChartOptions = {}
  ) {
    super(selector, options);
    this.data = data;
    this.options = {
      area: false,
      curve: 'linear',
      dotSize: 3,
      showDots: true,
      ...this.options,
    } as TimeSeriesChartOptions;

    // Create scales
    this.xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, this.contentWidth]);

    const minValue = d3.min(data, (d) => d.value) || 0;
    const maxValue = d3.max(data, (d) => d.value) || 0;
    const yDomain =
      minValue < 0 ? [minValue * 1.1, maxValue * 1.1] : [0, maxValue * 1.1];

    this.yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([this.contentHeight, 0]);

    this.render();
  }

  /**
   * Render the time series chart
   */
  private render(): void {
    // Create chart group
    const chartGroup = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // Add X and Y axes
    const xAxis = d3.axisBottom(this.xScale);
    const yAxis = d3.axisLeft(this.yScale);

    chartGroup
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.contentHeight})`)
      .call(xAxis);

    chartGroup.append('g').attr('class', 'y-axis').call(yAxis);

    // Create tooltip
    let tooltip;
    if (this.options.tooltip) {
      tooltip = this.createTooltip();
    }

    // Determine curve type
    let curveFunction;
    switch (this.options.curve) {
      case 'basis':
        curveFunction = d3.curveBasis;
        break;
      case 'cardinal':
        curveFunction = d3.curveCardinal;
        break;
      case 'step':
        curveFunction = d3.curveStep;
        break;
      default:
        curveFunction = d3.curveLinear;
    }

    // Create line function
    const line = d3
      .line<TimeSeriesData>()
      .x((d) => this.xScale(d.date))
      .y((d) => this.yScale(d.value))
      .curve(curveFunction);

    // Add area if enabled
    if (this.options.area) {
      const area = d3
        .area<TimeSeriesData>()
        .x((d) => this.xScale(d.date))
        .y0(this.contentHeight)
        .y1((d) => this.yScale(d.value))
        .curve(curveFunction);

      chartGroup
        .append('path')
        .datum(this.data)
        .attr('class', 'area')
        .attr('fill', this.options.colors![0])
        .attr('fill-opacity', 0.2)
        .attr('d', area);
    }

    // Add line
    const path = chartGroup
      .append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', this.options.colors![0])
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add animation if enabled
    if (this.options.animation) {
      const pathLength = path.node()!.getTotalLength();
      path
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(this.options.animationDuration!)
        .attr('stroke-dashoffset', 0);
    }

    // Add dots if enabled
    if (this.options.showDots) {
      const dots = chartGroup
        .selectAll('.dot')
        .data(this.data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => this.xScale(d.date))
        .attr('cy', (d) => this.yScale(d.value))
        .attr('r', 0)
        .attr('fill', this.options.colors![0]);

      if (this.options.animation) {
        dots
          .transition()
          .delay(
            (d, i) => i * (this.options.animationDuration! / this.data.length)
          )
          .duration(300)
          .attr('r', this.options.dotSize);
      } else {
        dots.attr('r', this.options.dotSize);
      }

      // Add tooltip events
      if (this.options.tooltip) {
        dots
          .on('mouseover', (event, d) => {
            tooltip!.transition().duration(200).style('opacity', 0.9);
            tooltip!
              .html(`${d3.timeFormat('%Y-%m-%d')(d.date)}: ${d.value}`)
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 28}px`);
          })
          .on('mouseout', () => {
            tooltip!.transition().duration(500).style('opacity', 0);
          });
      }
    }

    // Add title and axis labels
    this.addTitle();
    this.addAxisLabels();
  }

  /**
   * Update the chart when data or options change
   */
  protected update(): void {
    // Update scales
    this.xScale.range([0, this.contentWidth]);
    this.yScale.range([this.contentHeight, 0]);

    // Update axes
    this.svg
      .select('.x-axis')
      .attr('transform', `translate(0, ${this.contentHeight})`)
      .call(d3.axisBottom(this.xScale));

    this.svg.select('.y-axis').call(d3.axisLeft(this.yScale));

    // Determine curve type
    let curveFunction;
    switch (this.options.curve) {
      case 'basis':
        curveFunction = d3.curveBasis;
        break;
      case 'cardinal':
        curveFunction = d3.curveCardinal;
        break;
      case 'step':
        curveFunction = d3.curveStep;
        break;
      default:
        curveFunction = d3.curveLinear;
    }

    // Update line
    const line = d3
      .line<TimeSeriesData>()
      .x((d) => this.xScale(d.date))
      .y((d) => this.yScale(d.value))
      .curve(curveFunction);

    this.svg.select('.line').attr('d', line(this.data));

    // Update area if present
    if (this.options.area) {
      const area = d3
        .area<TimeSeriesData>()
        .x((d) => this.xScale(d.date))
        .y0(this.contentHeight)
        .y1((d) => this.yScale(d.value))
        .curve(curveFunction);

      this.svg.select('.area').attr('d', area(this.data));
    }

    // Update dots if present
    this.svg
      .selectAll('.dot')
      .attr('cx', (d) => this.xScale(d.date))
      .attr('cy', (d) => this.yScale(d.value));
  }
}

/**
 * Main chart factory that provides methods to create different chart types
 */
export class Chart {
  /**
   * Create a bar chart
   *
   * @param selector - CSS selector for the container element
   * @param data - Data for the bar chart
   * @param options - Chart options
   * @returns Bar chart instance
   */
  static bar(
    selector: string,
    data: BarChartData[],
    options: BarChartOptions = {}
  ): BarChart {
    return new BarChart(selector, data, options);
  }

  /**
   * Create a time series chart
   *
   * @param selector - CSS selector for the container element
   * @param data - Data for the time series chart
   * @param options - Chart options
   * @returns Time series chart instance
   */
  static timeseries(
    selector: string,
    data: TimeSeriesData[],
    options: TimeSeriesChartOptions = {}
  ): TimeSeriesChart {
    return new TimeSeriesChart(selector, data, options);
  }

  /**
   * Create a pie chart (implementation not shown for brevity)
   */
  static pie(/* parameters */): any {
    // Implementation would be similar to other chart types
  }

  /**
   * Create a scatter plot (implementation not shown for brevity)
   */
  static scatter(/* parameters */): any {
    // Implementation would be similar to other chart types
  }

  /**
   * Create a heatmap (implementation not shown for brevity)
   */
  static heatmap(/* parameters */): any {
    // Implementation would be similar to other chart types
  }

  /**
   * Create a treemap (implementation not shown for brevity)
   */
  static treemap(/* parameters */): any {
    // Implementation would be similar to other chart types
  }

  /**
   * Create a boxplot (implementation not shown for brevity)
   */
  static boxplot(/* parameters */): any {
    // Implementation would be similar to other chart types
  }

  /**
   * Create a combo chart (implementation not shown for brevity)
   */
  static combo(/* parameters */): any {
    // Implementation would be similar to other chart types
  }
}
```

## Usage Examples

### Python Examples

#### Basic Usage

The Python implementation adds a `viz` property to pandas DataFrame and Series objects, making it easy to create visualizations directly from your data:

```python
import pandas as pd
from vnstock.explorer.tcbs.trading import intraday_data

# Get intraday data for VNM
data = intraday_data(symbol="VNM", page_size=100)

# Create a time series chart
data.viz.timeseries(title="VNM Intraday Prices", grid=True, figsize=(10, 6))

# Create a bar chart
monthly_returns = data.resample('M').last().pct_change()
monthly_returns.viz.bar(title="Monthly Returns", color="green", grid=True)

# Create a pie chart
market_share = pd.Series({
    'VNM': 30,
    'VIC': 25,
    'MSN': 15,
    'FPT': 20,
    'VHM': 10
})
market_share.viz.pie(title="Market Share", figsize=(8, 8))

# Create a scatter plot
data.viz.scatter(x='volume', y='close', title="Volume vs Price", figsize=(10, 6))

# Create a heatmap
correlation = data[['open', 'high', 'low', 'close', 'volume']].corr()
correlation.viz.heatmap(title="Correlation Matrix", figsize=(8, 8))
```

#### Advanced Usage

```python
import pandas as pd
from vnstock.explorer.tcbs.trading import historical_data

# Get historical data for multiple symbols
symbols = ["VNM", "VIC", "FPT"]
data = pd.concat([historical_data(symbol=s, start_date="2022-01-01", end_date="2022-12-31") for s in symbols])

# Create a combo chart with volume as bars and price as line
vnm_data = data[data.symbol == 'VNM']
vnm_data.viz.combo(
    bar_data='volume',
    line_data='close',
    title="VNM Volume and Price",
    figsize=(12, 8)
)

# Create a boxplot of daily returns by month
daily_returns = data.set_index('time').groupby('symbol')['close'].pct_change().reset_index()
daily_returns['month'] = daily_returns['time'].dt.month
daily_returns.viz.boxplot(
    x='month',
    y='close',
    title="Daily Returns by Month",
    figsize=(12, 6)
)

# Create a treemap of market cap
market_cap = pd.DataFrame({
    'symbol': symbols,
    'market_cap': [10000, 20000, 5000]  # Example values
})
market_cap.viz.treemap(
    values='market_cap',
    labels='symbol',
    title="Market Cap by Company",
    figsize=(10, 10)
)
```

### TypeScript Examples with D3.js

#### Basic Bar Chart

```typescript
import { Chart } from './chart';

// Sample data
const data = [
  { key: 'VNM', value: 89.2 },
  { key: 'VIC', value: 55.3 },
  { key: 'VHM', value: 60.1 },
  { key: 'FPT', value: 75.8 },
  { key: 'MSN', value: 82.4 },
];

// Create a bar chart
Chart.bar('#chart-container', data, {
  title: 'Stock Prices',
  xLabel: 'Symbol',
  yLabel: 'Price (1000 VND)',
  colors: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f'],
  responsive: true,
  animation: true,
  valueLabels: true,
});
```

#### Time Series Chart

```typescript
import { Chart } from './chart';

// Fetch data from an API
async function fetchStockData(symbol: string) {
  const response = await fetch(`/api/stocks/${symbol}/history`);
  const data = await response.json();

  // Convert to the expected format
  return data.map((item: any) => ({
    date: new Date(item.date),
    value: item.close,
  }));
}

// Create a time series chart
async function createChart() {
  const data = await fetchStockData('VNM');

  Chart.timeseries('#chart-container', data, {
    title: 'VNM Historical Prices',
    xLabel: 'Date',
    yLabel: 'Price (1000 VND)',
    colors: ['#4e79a7'],
    area: true,
    curve: 'cardinal',
    showDots: true,
    dotSize: 3,
    responsive: true,
    animation: true,
  });
}

createChart();
```

#### Multiple Charts in Dashboard

```typescript
import { Chart } from './chart';

// Create a dashboard with multiple charts
async function createDashboard() {
  // Fetch data
  const priceData = await fetchStockData('VNM');
  const volumeData = await fetchVolumeData();
  const marketShareData = [
    { key: 'VNM', value: 30 },
    { key: 'VIC', value: 25 },
    { key: 'MSN', value: 15 },
    { key: 'FPT', value: 20 },
    { key: 'VHM', value: 10 },
  ];

  // Create price chart
  Chart.timeseries('#price-chart', priceData, {
    title: 'Stock Price',
    xLabel: 'Date',
    yLabel: 'Price',
    area: true,
    responsive: true,
  });

  // Create volume chart
  Chart.bar('#volume-chart', volumeData, {
    title: 'Trading Volume',
    xLabel: 'Date',
    yLabel: 'Volume',
    responsive: true,
  });

  // Create market share chart
  Chart.pie('#market-share-chart', marketShareData, {
    title: 'Market Share',
    responsive: true,
  });
}

createDashboard();
```

## Implementation Details

### Chart Types Support

Both implementations support a wide range of chart types:

1. **Bar Charts**: For comparing categorical data
2. **Line/Time Series Charts**: For visualizing data over time
3. **Pie Charts**: For showing proportions of a whole
4. **Scatter Plots**: For showing relationships between two variables
5. **Heatmaps**: For visualizing matrix data like correlations
6. **Treemaps**: For hierarchical data visualization
7. **Box Plots**: For statistical distributions
8. **Combo Charts**: For combining different chart types

### Interactive Features in D3.js

The D3.js implementation offers several interactive features:

1. **Tooltips**: Show detailed information on hover
2. **Animations**: Animate chart elements when they first appear
3. **Responsiveness**: Charts resize automatically to fit their container
4. **Themeing**: Support for light and dark themes
5. **Zoom/Pan**: Ability to zoom in and out of time series data (not shown in the example)

### Performance Considerations

For large datasets, consider these performance optimizations:

1. **Data Aggregation**: Aggregate data before visualization
2. **Canvas Rendering**: Use canvas instead of SVG for very large datasets
3. **Data Sampling**: Sample data points to reduce rendering time
4. **Lazy Loading**: Load and render data progressively

## Dependencies

### Python Dependencies

- `pandas`: For data manipulation
- `vnstock_ezchart.mplot`: For chart rendering

### TypeScript Dependencies

- `d3`: For data visualization
- Modern browsers that support SVG and JavaScript ES6 features

## Implementation Notes

1. The TypeScript implementation uses D3.js, which provides greater flexibility and interactivity compared to static Python plots.

2. The D3.js implementation follows an object-oriented approach with inheritance to keep the code DRY (Don't Repeat Yourself).

3. Both implementations provide a consistent API despite using different underlying technologies.

4. The TypeScript implementation includes responsive design by default, making charts work well on various screen sizes.

5. While the Python implementation is simpler to use, the D3.js implementation offers:

   - Interactive visualizations
   - Browser integration
   - Custom animations
   - Touch support
   - Accessibility features

6. For TypeScript applications, the chart implementations can be extended to integrate with frameworks like React, Angular, or Vue.

7. Consider adding more specialized chart types for financial data:
   - Candlestick charts
   - OHLC charts
   - Volume profile charts
   - Technical indicators
