/**
 * Module Integration Example
 *
 * This example demonstrates how different modules work together,
 * including dynamic data source switching and comparing data across modules
 */
import { Vnstock } from '../src/Vnstock';
import { DataSource, LogLevel } from '../src/types/config';
import { StockListing } from '../src/types/models';

// Initialize the main Vnstock instance with VCI as the default data source
const vnstock = new Vnstock({
  defaultSource: DataSource.VCI,
  logLevel: LogLevel.INFO,
});

// Test symbols
const testSymbols = ['VNM', 'FPT', 'HPG', 'VCB', 'TCB'];
const mainSymbol = 'VNM';

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
 * Demonstrate dynamic data source switching
 */
async function demonstrateSwitchingDataSources() {
  console.log('\n=== Dynamic Data Source Switching ===\n');

  try {
    // Get the current data source from one of the modules
    const currentSource = vnstock.quote.getDataSource();
    console.log(`Starting with data source: ${currentSource}`);

    // Get a quote with the default data source (VCI)
    const vciQuote = await vnstock.quote.getQuote(mainSymbol);
    console.log(`Quote from ${currentSource}:`, vciQuote.data);

    // Switch to TCBS and get a quote
    console.log('\nSwitching to TCBS data source...');
    vnstock.setDataSource(DataSource.TCBS);
    console.log(`Current data source: ${vnstock.quote.getDataSource()}`);

    const tcbsQuote = await vnstock.quote.getQuote(mainSymbol);
    console.log(`Quote from TCBS:`, tcbsQuote.data);

    // Switch to SSI and get a quote
    console.log('\nSwitching to SSI data source...');
    vnstock.setDataSource(DataSource.SSI);
    console.log(`Current data source: ${vnstock.quote.getDataSource()}`);

    const ssiQuote = await vnstock.quote.getQuote(mainSymbol);
    console.log(`Quote from SSI:`, ssiQuote.data);

    // Switch back to the default
    console.log('\nSwitching back to default data source...');
    vnstock.setDataSource(DataSource.VCI);
    console.log(`Current data source: ${vnstock.quote.getDataSource()}`);
  } catch (error) {
    console.error('Error demonstrating data source switching:', error);
  }
}

/**
 * Demonstrate module cross-referencing
 * Get stock listings, then get quotes for the first 5 stocks
 */
async function demonstrateModuleCrossReferencing() {
  console.log('\n=== Module Cross-Referencing ===\n');

  try {
    // Get listings from the listing module
    console.log('Getting stock listings from HOSE exchange...');
    const listings = await vnstock.listing.getStocksByExchange('HOSE');
    console.log(`Found ${listings.data.length} stocks on HOSE exchange`);

    // Take the first 5 listings
    const topStocks = listings.data.slice(0, 5);
    console.log(
      `Top 5 stocks: ${topStocks.map((stock) => stock.symbol).join(', ')}`
    );

    // Get quotes for these stocks using the quote module
    console.log('\nGetting quotes for these stocks...');
    const symbols = topStocks.map((stock) => stock.symbol);
    const quotes = await vnstock.quote.getQuotes(symbols);

    console.log('Quotes for top 5 stocks:');
    quotes.data.forEach((quote) => {
      console.log(`${quote.symbol}: ${quote.price} (${quote.change}%)`);
    });

    // Get company profiles for these stocks
    console.log('\nGetting company profiles for these stocks...');
    for (const symbol of symbols.slice(0, 2)) {
      // Only get the first 2 to save time
      const profile = await vnstock.company.getProfile(symbol);
      console.log(
        `${symbol} - ${profile.data.companyName} (${profile.data.industry})`
      );
    }
  } catch (error) {
    console.error('Error demonstrating module cross-referencing:', error);
  }
}

/**
 * Demonstrate data source specific features within modules
 */
async function demonstrateDataSourceSpecificFeatures() {
  console.log('\n=== Data Source Specific Module Features ===\n');

  try {
    // VCI-specific feature: Getting stocks by industry
    vnstock.setDataSource(DataSource.VCI);
    console.log('VCI-specific: Getting stocks by industry');
    const industryStocks = await vnstock.listing.getStocksByIndustry('Banking');
    console.log(`Found ${industryStocks.data.length} banking stocks`);
    console.log(
      'First 3 banking stocks:',
      industryStocks.data
        .slice(0, 3)
        .map((s) => s.symbol)
        .join(', ')
    );

    // Switch to SSI for intraday data
    vnstock.setDataSource(DataSource.SSI);
    console.log('\nSSI-specific: Getting intraday data');
    try {
      const intraday = await vnstock.quote.getIntraday(mainSymbol);
      console.log(
        `Got ${intraday.data.length} intraday data points for ${mainSymbol}`
      );
    } catch (error) {
      console.error(
        'Error getting intraday data (may not be supported):',
        error.message
      );
    }

    // Switch to TCBS for financial data
    vnstock.setDataSource(DataSource.TCBS);
    console.log('\nTCBS-specific: Getting financial ratios');
    try {
      const ratios = await vnstock.finance.getFinancialRatios(
        mainSymbol,
        'QUARTERLY'
      );
      console.log(
        `Financial ratios for ${mainSymbol}:`,
        Object.keys(ratios.data)
          .slice(0, 5)
          .map((key) => `${key}: ${ratios.data[key]}`)
          .join(', ')
      );
    } catch (error) {
      console.error(
        'Error getting financial ratios (may not be supported):',
        error.message
      );
    }
  } catch (error) {
    console.error('Error demonstrating data source specific features:', error);
  }
}

/**
 * Demonstrate batch operations and performance
 */
async function demonstrateBatchOperations() {
  console.log('\n=== Batch Operations and Performance ===\n');

  try {
    // Set to the default data source
    vnstock.setDataSource(DataSource.VCI);

    // Get historical data for multiple stocks in parallel
    console.log('Getting historical data for multiple stocks in parallel...');

    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const dateRange = {
      fromDate: formatDate(lastMonth),
      toDate: formatDate(today),
    };

    // Use Promise.all to run requests in parallel
    console.time('Parallel historical data fetch');
    const historicalDataPromises = testSymbols.map((symbol) =>
      vnstock.quote.getHistorical(symbol, dateRange)
    );

    const historicalResults = await Promise.all(historicalDataPromises);
    console.timeEnd('Parallel historical data fetch');

    // Report results
    historicalResults.forEach((result, index) => {
      console.log(
        `${testSymbols[index]}: ${result.data.length} historical data points`
      );
    });

    // Compare with sequential execution
    console.log('\nGetting the same data sequentially...');
    console.time('Sequential historical data fetch');

    for (const symbol of testSymbols) {
      const result = await vnstock.quote.getHistorical(symbol, dateRange);
      console.log(`${symbol}: ${result.data.length} historical data points`);
    }

    console.timeEnd('Sequential historical data fetch');
  } catch (error) {
    console.error('Error demonstrating batch operations:', error);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('Starting Module Integration Examples...');

  await demonstrateSwitchingDataSources();
  await demonstrateModuleCrossReferencing();
  await demonstrateDataSourceSpecificFeatures();
  await demonstrateBatchOperations();

  console.log('\nAll examples completed!');
}

// Execute the examples
runAllExamples().catch((error) => {
  console.error('Error running examples:', error);
});
