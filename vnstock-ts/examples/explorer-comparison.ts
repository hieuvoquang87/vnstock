/**
 * Explorer Comparison Example
 *
 * This example demonstrates how to use the explorer classes directly
 * and compares data from different data sources
 */
import { VciExplorer } from '../src/core/explorer/vci';
import { TcbsExplorer } from '../src/core/explorer/tcbs';
import { SsiExplorer } from '../src/core/explorer/ssi';
import { DataSource } from '../src/types/config';

// Create explorer instances for each data source
const vciExplorer = new VciExplorer();
const tcbsExplorer = new TcbsExplorer();
const ssiExplorer = new SsiExplorer();

// Test symbols to use
const testSymbols = ['VNM', 'FPT', 'VCB'];
const testSymbol = 'VNM';

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
 * Compare quotes from different data sources
 */
async function compareQuotes() {
  console.log('\n=== Comparing Quotes from Different Data Sources ===\n');

  try {
    // Get quotes from each data source
    const vciQuote = await vciExplorer.getQuote(testSymbol);
    const tcbsQuote = await tcbsExplorer.getQuote(testSymbol);
    const ssiQuote = await ssiExplorer.getQuote(testSymbol);

    console.log(`Quote for ${testSymbol} from VCI:`, vciQuote.data);
    console.log(`Quote for ${testSymbol} from TCBS:`, tcbsQuote.data);
    console.log(`Quote for ${testSymbol} from SSI:`, ssiQuote.data);

    // Compare price data
    console.log('\n--- Price Comparison ---');
    console.log(`VCI Price: ${vciQuote.data.price}`);
    console.log(`TCBS Price: ${tcbsQuote.data.price}`);
    console.log(`SSI Price: ${ssiQuote.data.price}`);

    // Compare volume data
    console.log('\n--- Volume Comparison ---');
    console.log(`VCI Volume: ${vciQuote.data.volume}`);
    console.log(`TCBS Volume: ${tcbsQuote.data.volume}`);
    console.log(`SSI Volume: ${ssiQuote.data.volume}`);
  } catch (error) {
    console.error('Error comparing quotes:', error);
  }
}

/**
 * Compare company profiles from different data sources
 */
async function compareCompanyProfiles() {
  console.log(
    '\n=== Comparing Company Profiles from Different Data Sources ===\n'
  );

  try {
    // Get company profiles from each data source
    const vciProfile = await vciExplorer.getCompanyProfile(testSymbol);
    const tcbsProfile = await tcbsExplorer.getCompanyProfile(testSymbol);
    const ssiProfile = await ssiExplorer.getCompanyProfile(testSymbol);

    console.log(`Company Profile for ${testSymbol} from VCI:`, {
      name: vciProfile.data.companyName,
      industry: vciProfile.data.industry,
      sector: vciProfile.data.sector,
    });

    console.log(`Company Profile for ${testSymbol} from TCBS:`, {
      name: tcbsProfile.data.companyName,
      industry: tcbsProfile.data.industry,
      sector: tcbsProfile.data.sector,
    });

    console.log(`Company Profile for ${testSymbol} from SSI:`, {
      name: ssiProfile.data.companyName,
      industry: ssiProfile.data.industry,
      sector: ssiProfile.data.sector,
    });
  } catch (error) {
    console.error('Error comparing company profiles:', error);
  }
}

/**
 * Compare historical OHLC data from different data sources
 */
async function compareHistoricalData() {
  console.log(
    '\n=== Comparing Historical OHLC Data from Different Data Sources ===\n'
  );

  // Prepare date range (last 7 days)
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const dateRange = {
    fromDate: formatDate(lastWeek),
    toDate: formatDate(today),
  };

  try {
    // Get historical data from each data source
    const vciData = await vciExplorer.getHistoricalOHLC(testSymbol, dateRange);
    const tcbsData = await tcbsExplorer.getHistoricalOHLC(
      testSymbol,
      dateRange
    );
    const ssiData = await ssiExplorer.getHistoricalOHLC(testSymbol, dateRange);

    console.log(`Historical Data Count for ${testSymbol}:`);
    console.log(`VCI: ${vciData.data.length} records`);
    console.log(`TCBS: ${tcbsData.data.length} records`);
    console.log(`SSI: ${ssiData.data.length} records`);

    // Compare the most recent data point
    if (
      vciData.data.length > 0 &&
      tcbsData.data.length > 0 &&
      ssiData.data.length > 0
    ) {
      console.log('\n--- Most Recent Data Point Comparison ---');
      console.log('VCI:', vciData.data[0]);
      console.log('TCBS:', tcbsData.data[0]);
      console.log('SSI:', ssiData.data[0]);
    }
  } catch (error) {
    console.error('Error comparing historical data:', error);
  }
}

/**
 * Compare listing data from different data sources
 */
async function compareListings() {
  console.log(
    '\n=== Comparing Stock Listings from Different Data Sources ===\n'
  );

  try {
    // Get listings from each data source
    const vciListings = await vciExplorer.getListing();
    const tcbsListings = await tcbsExplorer.getListing();
    const ssiListings = await ssiExplorer.getListing();

    console.log('Listing Count:');
    console.log(`VCI: ${vciListings.data.length} stocks`);
    console.log(`TCBS: ${tcbsListings.data.length} stocks`);
    console.log(`SSI: ${ssiListings.data.length} stocks`);

    // Compare the first 3 entries
    console.log('\n--- First 3 Listings Sample ---');
    console.log('VCI:', vciListings.data.slice(0, 3));
    console.log('TCBS:', tcbsListings.data.slice(0, 3));
    console.log('SSI:', ssiListings.data.slice(0, 3));

    // Check if test symbols exist in each data source
    for (const symbol of testSymbols) {
      console.log(`\nChecking for ${symbol} in each data source:`);
      const vciHasSymbol = vciListings.data.some(
        (item) => item.symbol === symbol
      );
      const tcbsHasSymbol = tcbsListings.data.some(
        (item) => item.symbol === symbol
      );
      const ssiHasSymbol = ssiListings.data.some(
        (item) => item.symbol === symbol
      );

      console.log(`VCI: ${vciHasSymbol ? 'Found' : 'Not found'}`);
      console.log(`TCBS: ${tcbsHasSymbol ? 'Found' : 'Not found'}`);
      console.log(`SSI: ${ssiHasSymbol ? 'Found' : 'Not found'}`);
    }
  } catch (error) {
    console.error('Error comparing listings:', error);
  }
}

/**
 * Test data source specific features
 */
async function testSourceSpecificFeatures() {
  console.log('\n=== Testing Data Source Specific Features ===\n');

  try {
    // VCI-specific feature: Getting filtered listings by industry
    console.log('VCI-specific: Getting listings by industry');
    const industryListings = await vciExplorer.getFilteredListing(
      undefined,
      'Food & Beverage',
      undefined
    );
    console.log(
      `Found ${industryListings.data.length} stocks in Food & Beverage industry`
    );

    // SSI-specific feature: Intraday data
    console.log('\nSSI-specific: Getting intraday data');
    const intradayData = await ssiExplorer.getIntraday(testSymbol);
    console.log(
      `Found ${intradayData.data.length} intraday data points for ${testSymbol}`
    );

    // TCBS-specific feature: Financial ratios
    console.log('\nTCBS-specific: Getting financial ratios');
    const ratios = await tcbsExplorer.getFinancialRatios(
      testSymbol,
      'quarterly'
    );
    console.log(`Financial ratios for ${testSymbol}:`, ratios.data);
  } catch (error) {
    console.error('Error testing source-specific features:', error);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('Starting Explorer Comparison Examples...');

  await compareQuotes();
  await compareCompanyProfiles();
  await compareHistoricalData();
  await compareListings();
  await testSourceSpecificFeatures();

  console.log('\nAll examples completed!');
}

// Execute the examples
runAllExamples().catch((error) => {
  console.error('Error running examples:', error);
});
