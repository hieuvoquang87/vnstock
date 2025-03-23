import axios, { AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';
import {
  BalanceSheet,
  CashFlow,
  CompanyEvents,
  CompanyNews,
  CompanyOfficers,
  CompanyOverview,
  Dividends,
  FinancialRatios,
  HistoricalPriceData,
  IncomeStatement,
  InsiderDeals,
  IntradayTradingData,
  PriceBoard,
  ShareholdersInfo,
  StockScreeningData,
  Subsidiaries,
} from './TcbsDataTypes';

export interface StockInfo {
  symbol: string;
  companyName: string;
  exchange: string;
  industry: string;
}

// Constants
const BASE_URL = 'https://apipubaws.tcbs.com.vn';
const STOCKS_URL = 'stock-insight';
const FUTURE_URL = 'futures-insight';
const ANALYSIS_URL = 'tcanalysis';
const LIGO_URL = 'ligo';

// Helper function to save response to JSON file
async function saveResponseToFile(data: any, filename: string) {
  const dir = path.join(process.cwd(), 'samples', 'tcbs');

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, `${filename}.json`);
  await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2));
  console.log(`Response saved to ${filepath}`);
}

// Helper function for consistent error handling
function handleRequestError(error: unknown, context: string): null {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const url = axiosError.config?.url || 'unknown URL';
    const status = axiosError.response?.status || 'no status';
    const message = axiosError.message || 'No error message';

    console.error(`Error ${context}: ${url} (Status: ${status}) - ${message}`);
  } else {
    console.error(`Error ${context}: ${error}`);
  }
  return null;
}

// Company Information APIs
export async function getCompanyOverview(
  symbol: string
): Promise<CompanyOverview | null> {
  try {
    const response = await axios.get<CompanyOverview>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/ticker/${symbol}/overview`
    );
    await saveResponseToFile(response.data, 'company_overview');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting company overview for ${symbol}`);
  }
}

export async function getCompanyProfile(symbol: string): Promise<any | null> {
  try {
    const response = await axios.get(
      `${BASE_URL}/${ANALYSIS_URL}/v1/company/${symbol}/overview`
    );
    await saveResponseToFile(response.data, 'company_profile');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting company profile for ${symbol}`);
  }
}

export async function getShareholdersInfo(
  symbol: string
): Promise<ShareholdersInfo | null> {
  try {
    const response = await axios.get<ShareholdersInfo>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/company/${symbol}/large-share-holders`
    );
    await saveResponseToFile(response.data, 'shareholders_info');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting shareholders info for ${symbol}`);
  }
}

export async function getInsiderDeals(
  symbol: string,
  page: number = 0,
  size: number = 20
): Promise<InsiderDeals | null> {
  try {
    const response = await axios.get<InsiderDeals>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/company/${symbol}/insider-dealing`,
      {
        params: { page, size },
      }
    );
    await saveResponseToFile(response.data, 'insider_deals');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting insider deals for ${symbol}`);
  }
}

export async function getSubsidiaries(
  symbol: string,
  page: number = 0,
  size: number = 100
): Promise<Subsidiaries | null> {
  try {
    const response = await axios.get<Subsidiaries>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/company/${symbol}/sub-companies`,
      {
        params: { page, size },
      }
    );
    await saveResponseToFile(response.data, 'subsidiaries');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting subsidiaries for ${symbol}`);
  }
}

export async function getCompanyOfficers(
  symbol: string,
  page: number = 0,
  size: number = 20
): Promise<CompanyOfficers | null> {
  try {
    const response = await axios.get<CompanyOfficers>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/company/${symbol}/key-officers`,
      {
        params: { page, size },
      }
    );
    await saveResponseToFile(response.data, 'company_officers');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting company officers for ${symbol}`);
  }
}

export async function getCompanyEvents(
  symbol: string,
  page: number = 0,
  size: number = 15
): Promise<CompanyEvents | null> {
  try {
    const response = await axios.get<CompanyEvents>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/ticker/${symbol}/events-news`,
      {
        params: { page, size },
      }
    );
    await saveResponseToFile(response.data, 'company_events');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting company events for ${symbol}`);
  }
}

export async function getCompanyNews(
  symbol: string,
  page: number = 0,
  size: number = 15
): Promise<CompanyNews | null> {
  try {
    const response = await axios.get<CompanyNews>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/ticker/${symbol}/activity-news`,
      {
        params: { page, size },
      }
    );
    await saveResponseToFile(response.data, 'company_news');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting company news for ${symbol}`);
  }
}

export async function getDividends(
  symbol: string,
  page: number = 0,
  size: number = 15
): Promise<Dividends | null> {
  try {
    const response = await axios.get<Dividends>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/company/${symbol}/dividend-payment-histories`,
      {
        params: { page, size },
      }
    );
    await saveResponseToFile(response.data, 'dividends');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting dividends for ${symbol}`);
  }
}

// Financial Reports APIs
export async function getBalanceSheet(
  symbol: string,
  yearly: boolean = true,
  isAll: boolean = true
): Promise<BalanceSheet | null> {
  try {
    const response = await axios.get<BalanceSheet>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/finance/${symbol}/balancesheet`,
      {
        params: { yearly: yearly ? 1 : 0, isAll },
      }
    );
    await saveResponseToFile(response.data, 'balance_sheet');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting balance sheet for ${symbol}`);
  }
}

export async function getIncomeStatement(
  symbol: string,
  yearly: boolean = true,
  isAll: boolean = true
): Promise<IncomeStatement | null> {
  try {
    const response = await axios.get<IncomeStatement>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/finance/${symbol}/incomestatement`,
      {
        params: { yearly: yearly ? 1 : 0, isAll },
      }
    );
    await saveResponseToFile(response.data, 'income_statement');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting income statement for ${symbol}`);
  }
}

export async function getCashFlow(
  symbol: string,
  yearly: boolean = true,
  isAll: boolean = true
): Promise<CashFlow | null> {
  try {
    const response = await axios.get<CashFlow>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/finance/${symbol}/cashflow`,
      {
        params: { yearly: yearly ? 1 : 0, isAll },
      }
    );
    await saveResponseToFile(response.data, 'cash_flow');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting cash flow for ${symbol}`);
  }
}

export async function getFinancialRatios(
  symbol: string,
  yearly: boolean = true,
  isAll: boolean = true
): Promise<FinancialRatios | null> {
  try {
    const response = await axios.get<FinancialRatios>(
      `${BASE_URL}/${ANALYSIS_URL}/v1/finance/${symbol}/financialratio`,
      {
        params: { yearly: yearly ? 1 : 0, isAll },
      }
    );
    await saveResponseToFile(response.data, 'financial_ratios');
    return response.data;
  } catch (error) {
    return handleRequestError(error, `getting financial ratios for ${symbol}`);
  }
}

// Market Data APIs
export async function getHistoricalPriceData(
  resolution: string,
  ticker: string,
  type: string = 'stock',
  to: number,
  countBack: number
): Promise<HistoricalPriceData | null> {
  try {
    const url =
      type === 'derivative'
        ? `${BASE_URL}/${FUTURE_URL}/v2/stock/bars-long-term`
        : `${BASE_URL}/${STOCKS_URL}/v2/stock/bars-long-term`;

    const response = await axios.get<HistoricalPriceData>(url, {
      params: { resolution, ticker, type, to, countBack },
    });

    await saveResponseToFile(response.data, 'historical_price_data');
    return response.data;
  } catch (error) {
    return handleRequestError(
      error,
      `getting historical price data for ${ticker}`
    );
  }
}

export async function getIntradayTradingData(
  symbol: string,
  page: number = 0,
  size: number = 100
): Promise<IntradayTradingData | null> {
  try {
    const response = await axios.get<IntradayTradingData>(
      `${BASE_URL}/${STOCKS_URL}/v1/intraday/${symbol}/his/paging`,
      {
        params: {
          page,
          size,
          headIndex: -1,
        },
      }
    );
    await saveResponseToFile(response.data, 'intraday_trading_data');
    return response.data;
  } catch (error) {
    return handleRequestError(
      error,
      `getting intraday trading data for ${symbol}`
    );
  }
}

export async function getPriceBoard(
  symbols: string[]
): Promise<PriceBoard | null> {
  try {
    const symbolsParam = symbols.join(',');
    const response = await axios.get<PriceBoard>(
      `${BASE_URL}/${STOCKS_URL}/v1/stock/second-tc-price`,
      {
        params: { tickers: symbolsParam },
      }
    );
    await saveResponseToFile(response.data, 'price_board');
    return response.data;
  } catch (error) {
    return handleRequestError(
      error,
      `getting price board for ${symbols.join(',')}`
    );
  }
}

// Stock Screener API
export async function stockScreening(
  exchangeName: string = 'HOSE,HNX,UPCOM',
  limit: number = 50
): Promise<StockScreeningData | null> {
  try {
    const filters = [
      { key: 'exchangeName', value: exchangeName, operator: '=' },
    ];

    const payload = {
      tcbsID: null,
      filters,
      size: limit,
    };

    // Add headers that match the Python implementation
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'vi',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Referer: 'https://tcinvest.tcbs.com.vn/',
      Origin: 'https://tcinvest.tcbs.com.vn',
    };

    const response = await axios.post<StockScreeningData>(
      `${BASE_URL}/${LIGO_URL}/v1/watchlist/preview`,
      payload,
      { headers }
    );

    await saveResponseToFile(response.data, 'stock_screening');
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'stock screening');
  }
}
