# FMARKET Fund Data Implementation

## Overview

This document details the implementation of the FMARKET fund data functionality in the vnstock TypeScript library. The FMARKET explorer provides comprehensive access to mutual fund data in Vietnam, including fund lists, details, NAV history, performance metrics, and asset allocation information.

## API Endpoints

The following FMARKET API endpoints are used to retrieve fund data:

| Endpoint                                               | Method | Description                                  |
| ------------------------------------------------------ | ------ | -------------------------------------------- |
| `https://api.fmarket.vn/data/funds`                    | GET    | List all funds with optional filtering       |
| `https://api.fmarket.vn/data/fund/:symbol`             | GET    | Get detailed information for a specific fund |
| `https://api.fmarket.vn/data/fund/:symbol/navs`        | GET    | Get NAV history for a specific fund          |
| `https://api.fmarket.vn/data/fund/:symbol/performance` | GET    | Get performance metrics for a specific fund  |
| `https://api.fmarket.vn/data/fund/:symbol/allocation`  | GET    | Get asset allocation for a specific fund     |
| `https://api.fmarket.vn/data/categories`               | GET    | Get list of fund categories                  |
| `https://api.fmarket.vn/data/companies`                | GET    | Get list of fund management companies        |

## Data Structures

### Fund Data Response

```typescript
interface FundData {
  symbol: string;
  name: string;
  shortName: string;
  companyId: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  currency: string;
  initialNav: number;
  currentNav: number;
  navDate: string;
  inceptionDate: string;
  description: string;
  investmentObjective: string;
  riskLevel: number;
  minInvestment: number;
  managementFee: number;
  subscriptionFee: number;
  redemptionFee: number;
  status: string;
  aum: number; // Assets Under Management
  isin: string;
  website: string;
}
```

### NAV History Response

```typescript
interface NavHistoryData {
  date: string;
  nav: number;
  change: number;
  changePercent: number;
}

interface NavHistoryResponse {
  symbol: string;
  data: NavHistoryData[];
}
```

### Performance Response

```typescript
interface PerformanceData {
  period: string; // '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'SI'
  return: number;
  benchmarkReturn?: number;
  excessReturn?: number;
}

interface PerformanceResponse {
  symbol: string;
  benchmark?: string;
  data: PerformanceData[];
}
```

### Asset Allocation Response

```typescript
interface AssetAllocationItem {
  type: string;
  percentage: number;
}

interface AssetAllocationResponse {
  symbol: string;
  date: string;
  data: AssetAllocationItem[];
}
```

## Implementation

### FmarketExplorer Class

```typescript
import axios from 'axios';
import {
  FMARKET_API_ENDPOINTS,
  FundCategory,
  FundPerformancePeriod,
  FMARKET_DEFAULT_HISTORY_DAYS,
  FMARKET_DEFAULT_TIMEOUT,
} from './const';

/**
 * Explorer for accessing FMARKET mutual fund data
 */
export class FmarketExplorer {
  private timeout: number;

  /**
   * Creates a new FmarketExplorer instance
   * @param timeout Request timeout in milliseconds
   */
  constructor(timeout: number = FMARKET_DEFAULT_TIMEOUT) {
    this.timeout = timeout;
  }

  /**
   * Gets a list of all mutual funds
   * @param category Optional category filter
   * @returns List of funds
   */
  async getFundList(category?: FundCategory): Promise<FundData[]> {
    const url = FMARKET_API_ENDPOINTS.FUNDS;
    const params = category ? { category } : {};

    try {
      const response = await axios.get(url, {
        params,
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error fetching fund list');
      return [];
    }
  }

  /**
   * Gets detailed information for a specific fund
   * @param symbol Fund symbol
   * @returns Fund details
   */
  async getFundDetails(symbol: string): Promise<FundData | null> {
    const url = FMARKET_API_ENDPOINTS.FUND_DETAIL(symbol);

    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `Error fetching details for fund ${symbol}`);
      return null;
    }
  }

  /**
   * Gets NAV history for a specific fund
   * @param symbol Fund symbol
   * @param days Number of days of history to retrieve
   * @returns NAV history data
   */
  async getFundNavHistory(
    symbol: string,
    days: number = FMARKET_DEFAULT_HISTORY_DAYS
  ): Promise<NavHistoryResponse | null> {
    const url = FMARKET_API_ENDPOINTS.FUND_NAV(symbol);

    try {
      const response = await axios.get(url, {
        params: { days },
        timeout: this.timeout,
      });
      return {
        symbol,
        data: response.data,
      };
    } catch (error) {
      this.handleError(error, `Error fetching NAV history for fund ${symbol}`);
      return null;
    }
  }

  /**
   * Gets performance metrics for a specific fund
   * @param symbol Fund symbol
   * @param period Performance period
   * @returns Performance data
   */
  async getFundPerformance(
    symbol: string,
    period?: FundPerformancePeriod
  ): Promise<PerformanceResponse | null> {
    const url = FMARKET_API_ENDPOINTS.FUND_DETAIL(symbol) + '/performance';
    const params = period ? { period } : {};

    try {
      const response = await axios.get(url, {
        params,
        timeout: this.timeout,
      });
      return {
        symbol,
        benchmark: response.data.benchmark,
        data: response.data.performance,
      };
    } catch (error) {
      this.handleError(error, `Error fetching performance for fund ${symbol}`);
      return null;
    }
  }

  /**
   * Gets asset allocation for a specific fund
   * @param symbol Fund symbol
   * @returns Asset allocation data
   */
  async getFundAssetAllocation(
    symbol: string
  ): Promise<AssetAllocationResponse | null> {
    const url = FMARKET_API_ENDPOINTS.FUND_DETAIL(symbol) + '/allocation';

    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
      });
      return {
        symbol,
        date: response.data.date,
        data: response.data.allocation,
      };
    } catch (error) {
      this.handleError(
        error,
        `Error fetching asset allocation for fund ${symbol}`
      );
      return null;
    }
  }

  /**
   * Gets a list of fund categories
   * @returns List of categories
   */
  async getFundCategories(): Promise<{ id: string; name: string }[]> {
    const url = FMARKET_API_ENDPOINTS.CATEGORIES;

    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error fetching fund categories');
      return [];
    }
  }

  /**
   * Gets a list of fund management companies
   * @returns List of companies
   */
  async getFundCompanies(): Promise<
    { id: string; name: string; website: string }[]
  > {
    const url = FMARKET_API_ENDPOINTS.COMPANIES;

    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error fetching fund companies');
      return [];
    }
  }

  /**
   * Gets the best performing funds for a given period
   * @param period Performance period
   * @param limit Number of funds to return
   * @param category Optional category filter
   * @returns List of top performing funds
   */
  async getTopPerformingFunds(
    period: FundPerformancePeriod = FundPerformancePeriod.ONE_YEAR,
    limit: number = 10,
    category?: FundCategory
  ): Promise<{ symbol: string; name: string; return: number }[]> {
    // First get all funds (optionally filtered by category)
    const funds = await this.getFundList(category);

    // Then get performance for each fund
    const performancePromises = funds.map((fund) =>
      this.getFundPerformance(fund.symbol, period)
    );

    try {
      const results = await Promise.all(performancePromises);

      // Filter out null results, extract the data we need, sort by return
      const performanceData = results
        .filter((result): result is PerformanceResponse => result !== null)
        .map((result) => {
          const periodData = result.data.find((d) => d.period === period);
          return {
            symbol: result.symbol,
            name: funds.find((f) => f.symbol === result.symbol)?.name || '',
            return: periodData ? periodData.return : 0,
          };
        })
        .sort((a, b) => b.return - a.return)
        .slice(0, limit);

      return performanceData;
    } catch (error) {
      this.handleError(
        error,
        `Error getting top performing funds for period ${period}`
      );
      return [];
    }
  }

  /**
   * Compares the performance of multiple funds
   * @param symbols Array of fund symbols to compare
   * @param periods Array of performance periods to include
   * @returns Comparison data for the specified funds
   */
  async compareFunds(
    symbols: string[],
    periods: FundPerformancePeriod[] = [
      FundPerformancePeriod.ONE_MONTH,
      FundPerformancePeriod.THREE_MONTH,
      FundPerformancePeriod.ONE_YEAR,
      FundPerformancePeriod.THREE_YEAR,
    ]
  ): Promise<
    {
      symbol: string;
      name: string;
      performance: { period: string; return: number }[];
    }[]
  > {
    if (!symbols.length) {
      return [];
    }

    try {
      // Get fund details and performance for each symbol
      const detailsPromises = symbols.map((symbol) =>
        this.getFundDetails(symbol)
      );
      const performancePromises = symbols.map((symbol) =>
        this.getFundPerformance(symbol)
      );

      const [detailsResults, performanceResults] = await Promise.all([
        Promise.all(detailsPromises),
        Promise.all(performancePromises),
      ]);

      // Build comparison result
      return symbols.map((symbol, index) => {
        const details = detailsResults[index];
        const performance = performanceResults[index];

        if (!details || !performance) {
          return {
            symbol,
            name: '',
            performance: [],
          };
        }

        // Filter performance data to requested periods
        const filteredPerformance = performance.data
          .filter((p) => periods.includes(p.period as FundPerformancePeriod))
          .map((p) => ({
            period: p.period,
            return: p.return,
          }));

        return {
          symbol,
          name: details.name,
          performance: filteredPerformance,
        };
      });
    } catch (error) {
      this.handleError(error, 'Error comparing funds');
      return [];
    }
  }

  /**
   * Calculates NAV returns over specific periods
   * @param symbol Fund symbol
   * @param navHistory NAV history data (optional, will be fetched if not provided)
   * @returns Calculated returns for various periods
   */
  async calculateNavReturns(
    symbol: string,
    navHistory?: NavHistoryData[]
  ): Promise<{ period: string; return: number }[]> {
    try {
      // If NAV history is not provided, fetch it
      if (!navHistory) {
        const historyResponse = await this.getFundNavHistory(symbol);
        if (!historyResponse) {
          return [];
        }
        navHistory = historyResponse.data;
      }

      if (!navHistory.length) {
        return [];
      }

      // Sort by date, newest first
      const sortedNav = [...navHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const currentNav = sortedNav[0].nav;
      const returns = [];

      // Get dates for different periods
      const today = new Date();
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);

      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);

      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      const threeYearsAgo = new Date(today);
      threeYearsAgo.setFullYear(today.getFullYear() - 3);

      const fiveYearsAgo = new Date(today);
      fiveYearsAgo.setFullYear(today.getFullYear() - 5);

      // YTD - beginning of current year
      const ytdDate = new Date(today.getFullYear(), 0, 1);

      // Find closest NAV dates to these periods
      const findClosestNav = (targetDate: Date) => {
        return sortedNav.reduce((closest, current) => {
          const currentDate = new Date(current.date);
          const closestDate = closest ? new Date(closest.date) : null;

          if (!closestDate) return current;

          const currentDiff = Math.abs(
            currentDate.getTime() - targetDate.getTime()
          );
          const closestDiff = Math.abs(
            closestDate.getTime() - targetDate.getTime()
          );

          return currentDiff < closestDiff ? current : closest;
        }, null as NavHistoryData | null);
      };

      // Calculate returns for each period
      const oneMonthNav = findClosestNav(oneMonthAgo);
      if (oneMonthNav) {
        returns.push({
          period: FundPerformancePeriod.ONE_MONTH,
          return: (currentNav / oneMonthNav.nav - 1) * 100,
        });
      }

      const threeMonthNav = findClosestNav(threeMonthsAgo);
      if (threeMonthNav) {
        returns.push({
          period: FundPerformancePeriod.THREE_MONTH,
          return: (currentNav / threeMonthNav.nav - 1) * 100,
        });
      }

      const sixMonthNav = findClosestNav(sixMonthsAgo);
      if (sixMonthNav) {
        returns.push({
          period: FundPerformancePeriod.SIX_MONTH,
          return: (currentNav / sixMonthNav.nav - 1) * 100,
        });
      }

      const ytdNav = findClosestNav(ytdDate);
      if (ytdNav) {
        returns.push({
          period: FundPerformancePeriod.YEAR_TO_DATE,
          return: (currentNav / ytdNav.nav - 1) * 100,
        });
      }

      const oneYearNav = findClosestNav(oneYearAgo);
      if (oneYearNav) {
        returns.push({
          period: FundPerformancePeriod.ONE_YEAR,
          return: (currentNav / oneYearNav.nav - 1) * 100,
        });
      }

      const threeYearNav = findClosestNav(threeYearsAgo);
      if (threeYearNav) {
        const annualizedReturn =
          Math.pow(currentNav / threeYearNav.nav, 1 / 3) - 1;
        returns.push({
          period: FundPerformancePeriod.THREE_YEAR,
          return: annualizedReturn * 100,
        });
      }

      const fiveYearNav = findClosestNav(fiveYearsAgo);
      if (fiveYearNav) {
        const annualizedReturn =
          Math.pow(currentNav / fiveYearNav.nav, 1 / 5) - 1;
        returns.push({
          period: FundPerformancePeriod.FIVE_YEAR,
          return: annualizedReturn * 100,
        });
      }

      // Since inception - oldest NAV point
      const oldestNav = sortedNav[sortedNav.length - 1];
      const inceptionDate = new Date(oldestNav.date);
      const years =
        (today.getTime() - inceptionDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365.25);

      if (years >= 1) {
        const annualizedReturn =
          Math.pow(currentNav / oldestNav.nav, 1 / years) - 1;
        returns.push({
          period: FundPerformancePeriod.SINCE_INCEPTION,
          return: annualizedReturn * 100,
        });
      } else {
        returns.push({
          period: FundPerformancePeriod.SINCE_INCEPTION,
          return: (currentNav / oldestNav.nav - 1) * 100,
        });
      }

      return returns;
    } catch (error) {
      this.handleError(
        error,
        `Error calculating NAV returns for fund ${symbol}`
      );
      return [];
    }
  }

  /**
   * Handles API errors
   * @param error Error object
   * @param message Error message prefix
   * @throws Enhanced error with contextual information
   */
  private handleError(error: any, message: string): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;

      // Enhance error message based on status code
      switch (status) {
        case 404:
          throw new Error(`${message}: Fund not found`);
        case 400:
          throw new Error(
            `${message}: ${responseData?.message || 'Bad request'}`
          );
        case 429:
          throw new Error(`${message}: Rate limit exceeded. Try again later.`);
        case 500:
          throw new Error(`${message}: Server error. Please try again later.`);
        default:
          throw new Error(`${message}: ${error.message}`);
      }
    } else {
      throw new Error(`${message}: ${error.message || 'Unknown error'}`);
    }
  }
}
```

## Usage Examples

### Basic Usage

```typescript
import { FmarketExplorer } from 'vnstock';
import { FundCategory, FundPerformancePeriod } from 'vnstock';

const main = async () => {
  const explorer = new FmarketExplorer();

  // Get all funds
  const allFunds = await explorer.getFundList();
  console.log(`Found ${allFunds.length} funds`);

  // Get equity funds only
  const equityFunds = await explorer.getFundList(FundCategory.EQUITY);
  console.log(`Found ${equityFunds.length} equity funds`);

  // Get details for a specific fund
  const fundDetails = await explorer.getFundDetails('VFMVF1');
  console.log(`Fund name: ${fundDetails?.name}`);
  console.log(
    `Current NAV: ${fundDetails?.currentNav} ${fundDetails?.currency}`
  );

  // Get NAV history
  const navHistory = await explorer.getFundNavHistory('VFMVF1', 90); // 90 days
  console.log(`NAV history points: ${navHistory?.data.length}`);

  // Get fund performance
  const performance = await explorer.getFundPerformance('VFMVF1');
  console.log('Performance:');
  performance?.data.forEach((p) => {
    console.log(`${p.period}: ${p.return.toFixed(2)}%`);
  });

  // Get asset allocation
  const allocation = await explorer.getFundAssetAllocation('VFMVF1');
  console.log('Asset allocation:');
  allocation?.data.forEach((a) => {
    console.log(`${a.type}: ${a.percentage.toFixed(2)}%`);
  });
};

main().catch(console.error);
```

### Advanced Usage Examples

#### Find Top Performing Funds

```typescript
import { FmarketExplorer } from 'vnstock';
import { FundPerformancePeriod, FundCategory } from 'vnstock';

const findTopPerformers = async () => {
  const explorer = new FmarketExplorer();

  // Find top 5 equity funds over the past year
  const topEquity = await explorer.getTopPerformingFunds(
    FundPerformancePeriod.ONE_YEAR,
    5,
    FundCategory.EQUITY
  );

  console.log('Top 5 Equity Funds (1-Year Return):');
  topEquity.forEach((fund, index) => {
    console.log(
      `${index + 1}. ${fund.symbol} - ${fund.name}: ${fund.return.toFixed(2)}%`
    );
  });

  // Find top 5 bond funds over the past 3 years
  const topBond = await explorer.getTopPerformingFunds(
    FundPerformancePeriod.THREE_YEAR,
    5,
    FundCategory.BOND
  );

  console.log('\nTop 5 Bond Funds (3-Year Return):');
  topBond.forEach((fund, index) => {
    console.log(
      `${index + 1}. ${fund.symbol} - ${fund.name}: ${fund.return.toFixed(2)}%`
    );
  });
};

findTopPerformers().catch(console.error);
```

#### Compare Multiple Funds

```typescript
import { FmarketExplorer } from 'vnstock';
import { FundPerformancePeriod } from 'vnstock';

const compareFunds = async () => {
  const explorer = new FmarketExplorer();

  // Compare 3 popular equity funds
  const comparison = await explorer.compareFunds(
    ['VFMVF1', 'DCBC', 'SSISCA'],
    [
      FundPerformancePeriod.ONE_MONTH,
      FundPerformancePeriod.SIX_MONTH,
      FundPerformancePeriod.ONE_YEAR,
      FundPerformancePeriod.THREE_YEAR,
    ]
  );

  // Create a table for comparison
  console.log('Fund Comparison:');
  console.log('-'.repeat(80));
  console.log('Fund\t\t| 1M\t\t| 6M\t\t| 1Y\t\t| 3Y (ann.)');
  console.log('-'.repeat(80));

  comparison.forEach((fund) => {
    const oneMonth = fund.performance.find(
      (p) => p.period === FundPerformancePeriod.ONE_MONTH
    );
    const sixMonth = fund.performance.find(
      (p) => p.period === FundPerformancePeriod.SIX_MONTH
    );
    const oneYear = fund.performance.find(
      (p) => p.period === FundPerformancePeriod.ONE_YEAR
    );
    const threeYear = fund.performance.find(
      (p) => p.period === FundPerformancePeriod.THREE_YEAR
    );

    console.log(
      `${fund.symbol} (${fund.name.substring(0, 10)}...)\t| ` +
        `${oneMonth ? oneMonth.return.toFixed(2) + '%' : 'N/A'}\t| ` +
        `${sixMonth ? sixMonth.return.toFixed(2) + '%' : 'N/A'}\t| ` +
        `${oneYear ? oneYear.return.toFixed(2) + '%' : 'N/A'}\t| ` +
        `${threeYear ? threeYear.return.toFixed(2) + '%' : 'N/A'}`
    );
  });
};

compareFunds().catch(console.error);
```

#### Calculate Custom Return Metrics

```typescript
import { FmarketExplorer } from 'vnstock';

const calculateCustomMetrics = async () => {
  const explorer = new FmarketExplorer();
  const symbol = 'VFMVF1';

  // Get NAV history for the past 3 years
  const navHistory = await explorer.getFundNavHistory(symbol, 365 * 3);
  if (!navHistory || !navHistory.data.length) {
    console.error('Could not fetch NAV history');
    return;
  }

  // Sort by date, oldest first
  const sortedNav = [...navHistory.data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate volatility (standard deviation of daily returns)
  const dailyReturns = [];
  for (let i = 1; i < sortedNav.length; i++) {
    const dailyReturn = sortedNav[i].nav / sortedNav[i - 1].nav - 1;
    dailyReturns.push(dailyReturn);
  }

  const avgDailyReturn =
    dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
  const variance =
    dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgDailyReturn, 2), 0) /
    dailyReturns.length;
  const dailyVolatility = Math.sqrt(variance);
  const annualizedVolatility = dailyVolatility * Math.sqrt(252); // Assuming 252 trading days per year

  // Calculate maximum drawdown
  let maxDrawdown = 0;
  let peak = sortedNav[0].nav;

  for (const point of sortedNav) {
    if (point.nav > peak) {
      peak = point.nav;
    }

    const drawdown = (peak - point.nav) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  // Get official returns from API for comparison
  const returns = await explorer.calculateNavReturns(symbol, sortedNav);
  const oneYearReturn = returns.find((r) => r.period === '1Y')?.return || 0;

  // Calculate Sharpe ratio (assuming risk-free rate of 4%)
  const riskFreeRate = 4; // 4% annual
  const sharpeRatio =
    (oneYearReturn - riskFreeRate) / (annualizedVolatility * 100);

  console.log(`Fund: ${symbol}`);
  console.log(
    `Annualized Volatility: ${(annualizedVolatility * 100).toFixed(2)}%`
  );
  console.log(`Maximum Drawdown: ${(maxDrawdown * 100).toFixed(2)}%`);
  console.log(`1-Year Return: ${oneYearReturn.toFixed(2)}%`);
  console.log(`Sharpe Ratio: ${sharpeRatio.toFixed(2)}`);
};

calculateCustomMetrics().catch(console.error);
```

## Implementation Considerations

1. **Error Handling:** The implementation includes comprehensive error handling for API failures, invalid responses, and data validation issues.

2. **Rate Limiting:** Consider implementing additional rate limiting strategies if making many concurrent requests to the FMARKET API.

3. **Caching:** Implement caching mechanisms for frequently accessed data such as fund lists and details to reduce API calls.

4. **Data Validation:** The implementation should validate all inputs and API responses to ensure data integrity.

5. **Performance Optimization:** For operations like comparing multiple funds or calculating custom metrics, consider implementing parallelized requests to improve performance.

6. **Documentation:** Use JSDoc comments for all methods and classes to provide good IDE integration and developer experience.

7. **Testing:** Implement comprehensive unit tests for all functionality, including mocking API responses and testing edge cases.

## Related Documentation

- [FMARKET Explorer Overview](./index.md)
- [FMARKET Constants and Configuration](./const.md)
