/**
 * Basic usage example for vnstock-ts
 */
import Vnstock, { DataSource, LogLevel } from '../src';

async function main() {
  // Initialize with custom config
  const vnstock = new Vnstock({
    logLevel: LogLevel.DEBUG,
    defaultSource: DataSource.VCI,
  });

  try {
    // Get a stock quote
    console.log('Getting quote for VNM...');
    const quoteResult = await vnstock.quote.getQuote('VNM');
    console.log('Quote result:', JSON.stringify(quoteResult, null, 2));

    // Get multiple quotes
    console.log('\nGetting quotes for multiple stocks...');
    const quotesResult = await vnstock.quote.getQuotes(['VNM', 'FPT', 'VIC']);
    console.log(
      'Multiple quotes result:',
      JSON.stringify(quotesResult, null, 2)
    );

    // Get historical data
    console.log('\nGetting historical data...');
    const historicalResult = await vnstock.quote.getHistorical('VNM', {
      fromDate: '2023-01-01',
      toDate: '2023-01-31',
    });
    console.log(
      'Historical data result:',
      JSON.stringify(historicalResult, null, 2)
    );

    // Get stock listings
    console.log('\nGetting stocks on HOSE...');
    const listingResult = await vnstock.listing.getStocksByExchange('HOSE', {
      limit: 5,
    });
    console.log('Listing result:', JSON.stringify(listingResult, null, 2));

    // Get company profile
    console.log('\nGetting company profile for VNM...');
    const companyResult = await vnstock.company.getProfile('VNM');
    console.log(
      'Company profile result:',
      JSON.stringify(companyResult, null, 2)
    );

    // Get ownership data
    console.log('\nGetting ownership data for VNM...');
    const ownershipResult = await vnstock.company.getOwnership('VNM');
    console.log('Ownership result:', JSON.stringify(ownershipResult, null, 2));

    // Get multiple company profiles
    console.log('\nGetting company profiles for multiple stocks...');
    const multipleCompanyResult = await vnstock.company.getMultipleProfiles([
      'VNM',
      'FPT',
      'VIC',
    ]);
    console.log(
      'Multiple company profiles:',
      JSON.stringify(multipleCompanyResult, null, 2)
    );

    // Switch data source
    console.log('\nSwitching data source to TCBS...');
    vnstock.setDataSource(DataSource.TCBS);
    const tcbsQuote = await vnstock.quote.getQuote('VNM');
    console.log('TCBS quote result:', JSON.stringify(tcbsQuote, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(console.error);
