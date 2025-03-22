/**
 * SSI Explorer Example
 *
 * This example demonstrates how to use the SSI Explorer
 * to access Vietnam stock market data from the SSI data source.
 */
import Vnstock from '../src/index';
import { DataSource, LogLevel } from '../src/types/config';

async function main() {
  // Initialize Vnstock with SSI as the default data source
  const vnstock = new Vnstock({
    logLevel: LogLevel.DEBUG,
    defaultSource: DataSource.SSI,
  });

  try {
    const symbol = 'VNM';
    console.log(`\n=== Getting data for ${symbol} from SSI ===\n`);

    // Get real-time quote
    const quoteResponse = await vnstock.quote.getQuote(symbol);
    console.log('Quote data:', quoteResponse.data);

    // Get historical OHLC data
    const historicalResponse = await vnstock.quote.getHistorical(symbol, {
      fromDate: '2023-01-01',
      toDate: '2023-01-31',
    });
    console.log('Historical data:', historicalResponse.data.slice(0, 3));

    // Get intraday data
    const intradayResponse = await vnstock.quote.getIntraday(symbol);
    console.log('Intraday data:', intradayResponse.data.slice(0, 3));

    // Get company profile
    const profileResponse = await vnstock.company.getProfile(symbol);
    console.log('Company profile:', profileResponse.data);

    // Get ownership data
    const ownershipResponse = await vnstock.company.getOwnership(symbol);
    console.log('Ownership data:', ownershipResponse.data);

    // Get income statement
    const incomeResponse = await vnstock.finance.getIncomeStatement(
      symbol,
      'QUARTERLY',
      4
    );
    console.log('Income statement:', incomeResponse.data);

    // Get balance sheet
    const balanceResponse = await vnstock.finance.getBalanceSheet(
      symbol,
      'YEARLY',
      3
    );
    console.log('Balance sheet:', balanceResponse.data);

    // Get financial ratios
    const ratiosResponse = await vnstock.finance.getFinancialRatios(
      symbol,
      'QUARTERLY',
      4
    );
    console.log('Financial ratios:', ratiosResponse.data);

    // Get stock listings
    const listingResponse = await vnstock.listing.getStocksByExchange('HOSE');
    console.log('HOSE listings:', listingResponse.data.slice(0, 5));
  } catch (error) {
    console.error('Error in example:', error);
  }
}

// Run the example
main().catch(console.error);
