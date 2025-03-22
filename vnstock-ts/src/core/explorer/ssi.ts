/**
 * SSI data source explorer
 */
import { BaseExplorer } from './base';
import { DataSource } from '../../types/config';
import {
  ApiResponse,
  DateRangeParams,
  PaginationParams,
} from '../../types/api';
import {
  CompanyProfile,
  FinancialStatement,
  IntradayTrade,
  OHLCData,
  Quote,
  StockListing,
} from '../../types/models';
import { getLogger } from '../utils/logger';
import { getHeaders } from '../utils/user_agent';

const logger = getLogger('SsiExplorer');

/**
 * SSI (Securities Services Inc.) data source explorer
 */
export class SsiExplorer extends BaseExplorer {
  /**
   * Constructor
   */
  constructor() {
    super(DataSource.SSI);

    // Set SSI-specific headers
    this.setHeaders(getHeaders(DataSource.SSI));

    logger.debug('Initialized SsiExplorer');
  }

  /**
   * Get stock quote
   * @param symbol - Stock symbol
   * @returns Quote data
   */
  public async getQuote(symbol: string): Promise<ApiResponse<Quote>> {
    logger.info(`Getting quote for symbol: ${symbol}`);

    return this.request<Quote>({
      url: this.buildUrl(this.endpoints.quote),
      params: { symbol },
    });
  }

  /**
   * Get multiple stock quotes
   * @param symbols - Array of stock symbols
   * @returns Quote data for multiple stocks
   */
  public async getQuotes(symbols: string[]): Promise<ApiResponse<Quote[]>> {
    logger.info(`Getting quotes for symbols: ${symbols.join(', ')}`);

    return this.request<Quote[]>({
      url: this.buildUrl(this.endpoints.quote),
      params: { symbols: symbols.join(',') },
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

    return this.request<IntradayTrade[]>({
      url: this.buildUrl(this.endpoints.intraday),
      params: {
        symbol,
        date: date || new Date().toISOString().split('T')[0],
      },
    });
  }

  /**
   * Get historical OHLC data
   * @param symbol - Stock symbol
   * @param params - Date range parameters
   * @returns Historical OHLC data
   */
  public async getHistoricalOHLC(
    symbol: string,
    params: DateRangeParams
  ): Promise<ApiResponse<OHLCData[]>> {
    logger.info(`Getting historical OHLC data for symbol: ${symbol}`);

    return this.request<OHLCData[]>({
      url: this.buildUrl(`${this.endpoints.quote}/history`),
      params: {
        symbol,
        from: params.fromDate,
        to: params.toDate,
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
      url: this.buildUrl(this.endpoints.company),
      params: { symbol },
    });
  }

  /**
   * Get financial statements
   * @param symbol - Stock symbol
   * @param type - Statement type (e.g., balance_sheet, income_statement)
   * @param period - Period (quarterly, yearly)
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
      url: this.buildUrl(this.endpoints.financial),
      params: {
        symbol,
        type,
        period,
        limit,
      },
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
      params,
    });
  }

  /**
   * Get filtered stock listing
   * @param exchange - Exchange filter (HOSE, HNX, UPCOM)
   * @param params - Pagination parameters
   * @returns Filtered stock listing
   */
  public async getFilteredListing(
    exchange?: string,
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    logger.info(`Getting filtered stock listing for exchange: ${exchange}`);

    return this.request<StockListing[]>({
      url: this.buildUrl(this.endpoints.listing),
      params: {
        ...params,
        exchange,
      },
    });
  }
}
