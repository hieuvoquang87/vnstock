/**
 * TCBS data source explorer
 */
import { BaseExplorer } from './base';
import { DataSource } from '../../types/config';
import {
  ApiResponse,
  DateRangeParams,
  PaginationParams,
  TimeframeOption,
} from '../../types/api';
import {
  CompanyProfile,
  FinancialRatio,
  FinancialStatement,
  IntradayTrade,
  OHLCData,
  OwnershipData,
  Quote,
  StockListing,
} from '../../types/models';
import { getLogger } from '../utils/logger';
import { getHeaders } from '../utils/user_agent';

const logger = getLogger('TcbsExplorer');

/**
 * TCBS (Techcombank Securities) data source explorer
 */
export class TcbsExplorer extends BaseExplorer {
  /**
   * Constructor
   */
  constructor() {
    super(DataSource.TCBS);

    // Set TCBS-specific headers
    this.setHeaders(getHeaders(DataSource.TCBS));

    logger.debug('Initialized TcbsExplorer');
  }

  /**
   * Get stock quote
   * @param symbol - Stock symbol
   * @returns Quote data
   */
  public async getQuote(symbol: string): Promise<ApiResponse<Quote>> {
    logger.info(`Getting quote for symbol: ${symbol}`);

    return this.request<Quote>({
      url: this.buildUrl(
        `${this.endpoints.quote}/companies/${symbol}/historical-quotes`
      ),
      params: {
        ticker: symbol,
        type: '1D',
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      },
    });
  }

  /**
   * Get multiple stock quotes
   * @param symbols - Array of stock symbols
   * @returns Quote data for multiple stocks
   */
  public async getQuotes(symbols: string[]): Promise<ApiResponse<Quote[]>> {
    logger.info(`Getting quotes for symbols: ${symbols.join(', ')}`);

    // TCBS doesn't have a bulk quote endpoint, so we need to make multiple requests
    const promises = symbols.map((symbol) => this.getQuote(symbol));
    const results = await Promise.all(promises);

    // Combine results
    const quotes = results.map((result) => result.data);

    return {
      status: 'success',
      data: quotes,
    };
  }

  /**
   * Get historical OHLC data
   * @param symbol - Stock symbol
   * @param params - Date range parameters
   * @param timeframe - Timeframe option
   * @returns Historical OHLC data
   */
  public async getHistoricalOHLC(
    symbol: string,
    params: DateRangeParams,
    timeframe: TimeframeOption = '1D'
  ): Promise<ApiResponse<OHLCData[]>> {
    logger.info(`Getting historical OHLC data for symbol: ${symbol}`);

    return this.request<OHLCData[]>({
      url: this.buildUrl(
        `${this.endpoints.quote}/companies/${symbol}/historical-quotes`
      ),
      params: {
        ticker: symbol,
        type: timeframe,
        from: params.fromDate,
        to: params.toDate,
      },
    });
  }

  /**
   * Get intraday trading data
   * @param symbol - Stock symbol
   * @param date - Trading date (defaults to today)
   * @returns Intraday trading data
   */
  public async getIntraday(
    symbol: string,
    date?: string
  ): Promise<ApiResponse<IntradayTrade[]>> {
    logger.info(`Getting intraday data for symbol: ${symbol}`);

    const tradingDate = date || new Date().toISOString().split('T')[0];

    return this.request<IntradayTrade[]>({
      url: this.buildUrl(
        `${this.endpoints.quote}/companies/${symbol}/intraday`
      ),
      params: {
        ticker: symbol,
        date: tradingDate,
      },
    });
  }

  /**
   * Get company profile
   * @param symbol - Stock symbol
   * @returns Company profile data
   */
  public async getCompanyProfile(
    symbol: string
  ): Promise<ApiResponse<CompanyProfile>> {
    logger.info(`Getting company profile for symbol: ${symbol}`);

    return this.request<CompanyProfile>({
      url: this.buildUrl(`${this.endpoints.company}/${symbol}/overview`),
      params: { ticker: symbol },
    });
  }

  /**
   * Get financial statements
   * @param symbol - Stock symbol
   * @param type - Statement type (e.g., 'incomestatement', 'balancesheet', 'cashflow')
   * @param period - Period ('quarterly', 'yearly')
   * @param limit - Number of periods to return
   * @returns Financial statement data
   */
  public async getFinancialStatements(
    symbol: string,
    type: string,
    period: string,
    limit = 4
  ): Promise<ApiResponse<FinancialStatement>> {
    logger.info(`Getting ${type} for symbol: ${symbol}, period: ${period}`);

    return this.request<FinancialStatement>({
      url: this.buildUrl(`${this.endpoints.financial}/${symbol}`),
      params: {
        ticker: symbol,
        type,
        period,
        size: limit,
      },
    });
  }

  /**
   * Get financial ratios
   * @param symbol - Stock symbol
   * @param period - Period ('quarterly', 'yearly')
   * @param limit - Number of periods to return
   * @returns Financial ratios data
   */
  public async getFinancialRatios(
    symbol: string,
    period: string,
    limit = 4
  ): Promise<ApiResponse<FinancialRatio>> {
    logger.info(
      `Getting financial ratios for symbol: ${symbol}, period: ${period}`
    );

    return this.request<FinancialRatio>({
      url: this.buildUrl(`${this.endpoints.financial}/${symbol}/ratios`),
      params: {
        ticker: symbol,
        period,
        size: limit,
      },
    });
  }

  /**
   * Get stock ownership data
   * @param symbol - Stock symbol
   * @returns Ownership data
   */
  public async getOwnership(
    symbol: string
  ): Promise<ApiResponse<OwnershipData>> {
    logger.info(`Getting ownership data for symbol: ${symbol}`);

    return this.request<OwnershipData>({
      url: this.buildUrl(`${this.endpoints.ownership}/${symbol}`),
      params: { ticker: symbol },
    });
  }

  /**
   * Get stock listing data
   * @param params - Pagination parameters
   * @returns Stock listing data
   */
  public async getListing(
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    logger.info('Getting stock listing data');

    return this.request<StockListing[]>({
      url: this.buildUrl(this.endpoints.listing),
      params: {
        size: params?.limit || 500,
        page: params?.page || 1,
      },
    });
  }

  /**
   * Get filtered stock listing
   * @param exchange - Exchange filter (HOSE, HNX, UPCOM)
   * @param industry - Industry filter
   * @param params - Pagination parameters
   * @returns Filtered stock listing
   */
  public async getFilteredListing(
    exchange?: string,
    industry?: string | number,
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    logger.info(
      `Getting filtered stock listing for exchange: ${exchange}, industry: ${industry}`
    );

    return this.request<StockListing[]>({
      url: this.buildUrl(this.endpoints.listing),
      params: {
        exchange,
        industry,
        size: params?.limit || 500,
        page: params?.page || 1,
      },
    });
  }

  /**
   * Screen stocks based on criteria
   * @param criteria - Screening criteria
   * @param params - Pagination parameters
   * @returns Screened stock list
   */
  public async screenStocks(
    criteria: Record<string, any>,
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    logger.info('Screening stocks with criteria');

    return this.request<StockListing[]>({
      url: this.buildUrl(this.endpoints.screener),
      method: 'POST',
      payload: {
        ...criteria,
        size: params?.limit || 50,
        page: params?.page || 1,
      },
    });
  }
}
