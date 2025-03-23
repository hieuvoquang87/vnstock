import {
  getCompanyOverview,
  getCompanyProfile,
  getShareholdersInfo,
  getInsiderDeals,
  getSubsidiaries,
  getCompanyOfficers,
  getCompanyEvents,
  getCompanyNews,
  getDividends,
  getBalanceSheet,
  getIncomeStatement,
  getCashFlow,
  getFinancialRatios,
  getHistoricalPriceData,
  getIntradayTradingData,
  getPriceBoard,
  stockScreening,
} from './tcbsClient';

// Example usage:
async function main() {
  try {
    const symbol = 'VNM';

    // Company Information
    await getCompanyOverview(symbol);
    await getCompanyProfile(symbol);
    await getShareholdersInfo(symbol);
    await getInsiderDeals(symbol);
    await getSubsidiaries(symbol);
    await getCompanyOfficers(symbol);
    await getCompanyEvents(symbol);
    await getCompanyNews(symbol);
    await getDividends(symbol);

    // Financial Reports
    await getBalanceSheet(symbol, true);
    await getIncomeStatement(symbol, true);
    await getCashFlow(symbol, true);
    await getFinancialRatios(symbol, true);

    // Market Data
    const now = Math.floor(Date.now() / 1000);
    await getHistoricalPriceData('D', symbol, 'stock', now, 365);
    await getIntradayTradingData(symbol);
    await getPriceBoard([symbol]);

    // Stock Screener
    await stockScreening('HOSE');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();
