/**
 * Finance module example for vnstock-ts
 */
import Vnstock, {
  DataSource,
  FinancialPeriod,
  FinancialStatementType,
  LogLevel,
} from '../src';

async function main() {
  // Initialize with custom config
  const vnstock = new Vnstock({
    logLevel: LogLevel.DEBUG,
    defaultSource: DataSource.TCBS, // TCBS has more comprehensive financial data
  });

  try {
    const symbol = 'VNM';

    // Get income statement
    console.log(`Getting income statement for ${symbol}...`);
    const incomeStatement = await vnstock.finance.getIncomeStatement(
      symbol,
      'QUARTERLY',
      4
    );
    console.log('Income Statement:', JSON.stringify(incomeStatement, null, 2));

    // Get balance sheet
    console.log(`\nGetting balance sheet for ${symbol}...`);
    const balanceSheet = await vnstock.finance.getBalanceSheet(
      symbol,
      'YEARLY',
      3
    );
    console.log('Balance Sheet:', JSON.stringify(balanceSheet, null, 2));

    // Get cash flow statement
    console.log(`\nGetting cash flow statement for ${symbol}...`);
    const cashFlow = await vnstock.finance.getCashFlow(symbol, 'QUARTERLY', 4);
    console.log('Cash Flow Statement:', JSON.stringify(cashFlow, null, 2));

    // Get financial statement by type
    console.log(`\nGetting financial statement by type for ${symbol}...`);
    const financialStatement = await vnstock.finance.getFinancialStatement(
      symbol,
      'INCOME',
      'YEARLY',
      2
    );
    console.log(
      'Financial Statement:',
      JSON.stringify(financialStatement, null, 2)
    );

    // Get financial ratios
    console.log(`\nGetting financial ratios for ${symbol}...`);
    const financialRatios = await vnstock.finance.getFinancialRatios(
      symbol,
      'QUARTERLY',
      4
    );
    console.log('Financial Ratios:', JSON.stringify(financialRatios, null, 2));

    // Change data source to VCI
    console.log('\nChanging data source to VCI...');
    vnstock.setDataSource(DataSource.VCI);

    // Get income statement from VCI
    console.log(`\nGetting income statement from VCI for ${symbol}...`);
    const vciIncomeStatement = await vnstock.finance.getIncomeStatement(
      symbol,
      'QUARTERLY',
      4
    );
    console.log(
      'VCI Income Statement:',
      JSON.stringify(vciIncomeStatement, null, 2)
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(console.error);
