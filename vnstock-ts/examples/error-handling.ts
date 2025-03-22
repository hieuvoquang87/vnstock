/**
 * Error Handling Example
 *
 * This example demonstrates proper error handling and working with
 * different explorers, including handling unexpected responses and
 * switching between data sources when one fails
 */
import { Vnstock } from '../src/Vnstock';
import { DataSource, LogLevel } from '../src/types/config';
import { VciExplorer } from '../src/core/explorer/vci';
import { TcbsExplorer } from '../src/core/explorer/tcbs';
import { SsiExplorer } from '../src/core/explorer/ssi';
import { ApiError, ValidationError } from '../src/types/api';
import { OHLCData } from '../src/types/models';

// Initialize the main Vnstock instance
const vnstock = new Vnstock({
  defaultSource: DataSource.VCI,
  logLevel: LogLevel.INFO,
});

// Create individual explorers for direct usage
const vciExplorer = new VciExplorer();
const tcbsExplorer = new TcbsExplorer();
const ssiExplorer = new SsiExplorer();

// Test symbols
const validSymbol = 'VNM';
const invalidSymbol = 'INVALID123';
const nonExistentSymbol = 'XYZ'; // Should be a symbol that doesn't exist but follows format

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Basic error handling example
 */
async function demonstrateBasicErrorHandling() {
  console.log('\n=== Basic Error Handling ===\n');

  // 1. Handle invalid symbol format (validation error)
  console.log('Testing with invalid symbol format...');
  try {
    await vnstock.quote.getQuote(invalidSymbol);
  } catch (error) {
    console.log('Successfully caught error for invalid symbol:');
    if (error instanceof ValidationError) {
      console.log(`Validation Error: ${error.message}`);
    } else {
      console.log(`Other Error: ${error.message}`);
    }
  }

  // 2. Handle non-existent symbol (API error)
  console.log('\nTesting with non-existent symbol...');
  try {
    await vnstock.quote.getQuote(nonExistentSymbol);
  } catch (error) {
    console.log('Successfully caught error for non-existent symbol:');
    if (error instanceof ApiError) {
      console.log(`API Error: ${error.message}`);
      console.log(`Status: ${error.status}`);
    } else {
      console.log(`Other Error: ${error.message}`);
    }
  }

  // 3. Successful request
  console.log('\nTesting with valid symbol...');
  try {
    const result = await vnstock.quote.getQuote(validSymbol);
    console.log(
      `Successfully retrieved quote for ${validSymbol}:`,
      result.data
    );
  } catch (error) {
    console.error('Unexpected error for valid symbol:', error);
  }
}

/**
 * Demonstrate failover between data sources
 */
async function demonstrateFailoverBetweenSources() {
  console.log('\n=== Failover Between Data Sources ===\n');

  const dataSources = [DataSource.VCI, DataSource.TCBS, DataSource.SSI];

  async function getQuoteWithFailover(symbol: string): Promise<any> {
    for (const source of dataSources) {
      try {
        console.log(`Attempting to get quote from ${source}...`);
        vnstock.setDataSource(source);
        const result = await vnstock.quote.getQuote(symbol);
        console.log(`Success with ${source}`);
        return result;
      } catch (error) {
        console.log(`Failed with ${source}: ${error.message}`);
        // Continue to next data source
      }
    }
    throw new Error('All data sources failed');
  }

  try {
    const result = await getQuoteWithFailover(validSymbol);
    console.log(`Successfully got quote after failover:`, result.data);
  } catch (error) {
    console.error('All data sources failed:', error.message);
  }
}

/**
 * Define a result type for the historical data comparison
 */
type SourceResult = {
  success: boolean;
  data: OHLCData[] | null;
  error: string | null;
  count: number;
};

/**
 * Demonstrate try-all approach (get data from all sources and compare)
 */
async function demonstrateTryAllSources() {
  console.log('\n=== Try All Sources and Compare ===\n');

  // Prepare date range (last month)
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const dateRange = {
    fromDate: formatDate(lastMonth),
    toDate: formatDate(today),
  };

  async function getHistoricalFromAllSources(symbol: string): Promise<{
    vci: SourceResult;
    tcbs: SourceResult;
    ssi: SourceResult;
  }> {
    const results = {
      vci: {
        success: false,
        data: null,
        error: null,
        count: 0,
      } as SourceResult,
      tcbs: {
        success: false,
        data: null,
        error: null,
        count: 0,
      } as SourceResult,
      ssi: {
        success: false,
        data: null,
        error: null,
        count: 0,
      } as SourceResult,
    };

    // VCI
    try {
      const vciResult = await vciExplorer.getHistoricalOHLC(symbol, dateRange);
      results.vci.success = true;
      results.vci.data = vciResult.data;
      results.vci.count = vciResult.data.length;
    } catch (error) {
      results.vci.success = false;
      results.vci.error = error.message;
    }

    // TCBS
    try {
      const tcbsResult = await tcbsExplorer.getHistoricalOHLC(
        symbol,
        dateRange
      );
      results.tcbs.success = true;
      results.tcbs.data = tcbsResult.data;
      results.tcbs.count = tcbsResult.data.length;
    } catch (error) {
      results.tcbs.success = false;
      results.tcbs.error = error.message;
    }

    // SSI
    try {
      const ssiResult = await ssiExplorer.getHistoricalOHLC(symbol, dateRange);
      results.ssi.success = true;
      results.ssi.data = ssiResult.data;
      results.ssi.count = ssiResult.data.length;
    } catch (error) {
      results.ssi.success = false;
      results.ssi.error = error.message;
    }

    return results;
  }

  try {
    console.log(
      `Getting historical data for ${validSymbol} from all sources...`
    );
    const results = await getHistoricalFromAllSources(validSymbol);

    console.log('Results summary:');
    console.log(
      `VCI: ${
        results.vci.success
          ? `Success (${results.vci.count} records)`
          : `Failed: ${results.vci.error}`
      }`
    );
    console.log(
      `TCBS: ${
        results.tcbs.success
          ? `Success (${results.tcbs.count} records)`
          : `Failed: ${results.tcbs.error}`
      }`
    );
    console.log(
      `SSI: ${
        results.ssi.success
          ? `Success (${results.ssi.count} records)`
          : `Failed: ${results.ssi.error}`
      }`
    );

    // Compare first record from each source
    console.log('\nComparing first record from each source:');
    if (
      results.vci.success &&
      results.vci.data &&
      results.vci.data.length > 0
    ) {
      console.log('VCI first record:', results.vci.data[0]);
    }

    if (
      results.tcbs.success &&
      results.tcbs.data &&
      results.tcbs.data.length > 0
    ) {
      console.log('TCBS first record:', results.tcbs.data[0]);
    }

    if (
      results.ssi.success &&
      results.ssi.data &&
      results.ssi.data.length > 0
    ) {
      console.log('SSI first record:', results.ssi.data[0]);
    }

    // Find the best source based on data availability
    let bestSource = 'none';
    let maxCount = 0;

    if (results.vci.success && results.vci.count > maxCount) {
      maxCount = results.vci.count;
      bestSource = 'VCI';
    }

    if (results.tcbs.success && results.tcbs.count > maxCount) {
      maxCount = results.tcbs.count;
      bestSource = 'TCBS';
    }

    if (results.ssi.success && results.ssi.count > maxCount) {
      maxCount = results.ssi.count;
      bestSource = 'SSI';
    }

    console.log(
      `\nBest source for ${validSymbol} historical data: ${bestSource} (${maxCount} records)`
    );
  } catch (error) {
    console.error('Unexpected error during try-all demonstration:', error);
  }
}

/**
 * Demonstrate handling feature unavailability in different sources
 */
async function demonstrateFeatureUnavailability() {
  console.log('\n=== Feature Unavailability Handling ===\n');

  // Try to get industry-filtered stocks from each source
  // (Only VCI supports this directly)
  const testAllSources = async () => {
    for (const source of [DataSource.VCI, DataSource.TCBS, DataSource.SSI]) {
      try {
        console.log(`Testing industry filtering with ${source}...`);
        vnstock.setDataSource(source);
        const result = await vnstock.listing.getStocksByIndustry('Banking');
        console.log(
          `Success with ${source}: Found ${result.data.length} stocks`
        );
      } catch (error) {
        console.log(`Failed with ${source}: ${error.message}`);
      }
    }
  };

  await testAllSources();
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('Starting Error Handling Examples...');

  await demonstrateBasicErrorHandling();
  await demonstrateFailoverBetweenSources();
  await demonstrateTryAllSources();
  await demonstrateFeatureUnavailability();

  console.log('\nAll examples completed!');
}

// Execute the examples
runAllExamples().catch((error) => {
  console.error('Error running examples:', error);
});
