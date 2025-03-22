/**
 * Module for managing listing data from VCI data source.
 */

import { getLogger, LogLevel } from '../../core/utils/logger';
import { sendRequest } from '../../core/utils/client';
import { getHeaders } from '../../core/utils/user_agent';
import { _GRAPHQL_URL, _GROUP_CODE } from './const';
import { StockListing } from '../../types/models';

const logger = getLogger('vnstock.explorer.vci.listing');

interface StockSymbol {
  ticker: string;
  organCode: string;
  name: string;
  organName: string;
  organShortName: string;
  icbCode: string;
  icbName: string;
  exchange: string;
  industry: string;
  [key: string]: any;
}

interface IndustryInfo {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  parentId: string;
  level: number;
  childCount: number;
  companyCount: number;
}

export class Listing {
  private headers: Record<string, string>;
  private dataCache: Record<string, any> = {};
  private showLog: boolean;

  /**
   * Initialize listing data provider from VCI data source.
   *
   * @param showLog - Show log information for debugging. Default is true.
   */
  constructor(showLog: boolean = true) {
    this.headers = getHeaders('VCI');
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel(LogLevel.CRITICAL);
    }
  }

  /**
   * Convert a VCI StockSymbol to a standardized StockListing
   *
   * @param symbol - Stock symbol from VCI
   * @returns Standardized StockListing object
   */
  private convertToStockListing(symbol: StockSymbol): StockListing {
    return {
      symbol: symbol.ticker,
      companyName: symbol.organName,
      shortName: symbol.organShortName || symbol.ticker,
      fullName: symbol.organName,
      exchange: symbol.exchange,
      industry: symbol.industryName || symbol.icbName,
      sector: '',
      industryCode: symbol.icbCode,
      sectorCode: '',
      marketCap: 0,
      sharesOutstanding: 0,
      listedDate: '',
      status: 'active',
    } as StockListing;
  }

  /**
   * Get all stock symbols from the market.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns List of all stock symbols
   */
  public async allSymbols(
    showLog: boolean = this.showLog
  ): Promise<StockSymbol[]> {
    const cacheKey = 'all_symbols';

    // Return cached data if available
    if (this.dataCache[cacheKey]) {
      return this.dataCache[cacheKey];
    }

    // GraphQL query to fetch all symbols
    const payload = {
      query: `query Query {
        MarketRealtimeScreener(filter: {}, size: 2000) {
          stockRealtimes {
            ticker
            organCode
            exchange
            exchangeName
            industryName
            industryNameEn
            industryID
            organTypeCode
            organName
            organShortName
            icbCode
            icbName
          }
        }
      }`,
      variables: {},
    };

    if (showLog) {
      logger.info('Fetching all stock symbols');
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.MarketRealtimeScreener) {
        return [];
      }

      // Process and format the data
      const symbols =
        responseData.data.MarketRealtimeScreener.stockRealtimes.map(
          (item: any) => ({
            ticker: item.ticker,
            organCode: item.organCode,
            name: item.organShortName,
            organName: item.organName,
            organShortName: item.organShortName,
            icbCode: item.icbCode,
            icbName: item.icbName,
            exchange: item.exchange,
            industry: item.industryName,
          })
        );

      // Cache the data
      this.dataCache[cacheKey] = symbols;
      return symbols;
    } catch (error) {
      logger.error(`Error fetching all symbols: ${error}`);
      throw error;
    }
  }

  /**
   * Get all stocks with optional limit
   *
   * @param limit - Maximum number of stocks to return
   * @returns List of stock listings
   */
  public async getStocks(limit?: number): Promise<StockListing[]> {
    const symbols = await this.allSymbols();

    // Convert to StockListing format
    let listings = symbols.map((symbol) => this.convertToStockListing(symbol));

    // Apply limit if specified
    if (limit && limit > 0 && limit < listings.length) {
      listings = listings.slice(0, limit);
    }

    return listings;
  }

  /**
   * Get stocks by exchange
   *
   * @param exchange - Exchange code (HOSE, HNX, UPCOM)
   * @param limit - Maximum number of stocks to return
   * @returns List of stock listings filtered by exchange
   */
  public async getStocksByExchange(
    exchange: string,
    limit?: number
  ): Promise<StockListing[]> {
    const symbols = await this.allSymbols();

    // Filter by exchange
    let filtered = symbols.filter((symbol) => symbol.exchange === exchange);

    // Convert to StockListing format
    let listings = filtered.map((symbol) => this.convertToStockListing(symbol));

    // Apply limit if specified
    if (limit && limit > 0 && limit < listings.length) {
      listings = listings.slice(0, limit);
    }

    return listings;
  }

  /**
   * Get stocks by industry
   *
   * @param industry - Industry name or code
   * @param limit - Maximum number of stocks to return
   * @returns List of stock listings filtered by industry
   */
  public async getStocksByIndustry(
    industry: string | number,
    limit?: number
  ): Promise<StockListing[]> {
    const symbols = await this.allSymbols();

    // Filter by industry
    let filtered = symbols.filter((symbol) => {
      if (typeof industry === 'string') {
        return symbol.industryName === industry || symbol.icbName === industry;
      } else {
        return symbol.icbCode === industry.toString();
      }
    });

    // Convert to StockListing format
    let listings = filtered.map((symbol) => this.convertToStockListing(symbol));

    // Apply limit if specified
    if (limit && limit > 0 && limit < listings.length) {
      listings = listings.slice(0, limit);
    }

    return listings;
  }

  /**
   * Get stocks filtered by both exchange and industry
   *
   * @param exchange - Exchange code (HOSE, HNX, UPCOM)
   * @param industry - Industry name or code
   * @param limit - Maximum number of stocks to return
   * @returns List of stock listings filtered by exchange and industry
   */
  public async getStocksByExchangeAndIndustry(
    exchange: string,
    industry: string | number,
    limit?: number
  ): Promise<StockListing[]> {
    const symbols = await this.allSymbols();

    // Filter by exchange and industry
    let filtered = symbols.filter((symbol) => {
      const exchangeMatch = symbol.exchange === exchange;
      let industryMatch = false;

      if (typeof industry === 'string') {
        industryMatch =
          symbol.industryName === industry || symbol.icbName === industry;
      } else {
        industryMatch = symbol.icbCode === industry.toString();
      }

      return exchangeMatch && industryMatch;
    });

    // Convert to StockListing format
    let listings = filtered.map((symbol) => this.convertToStockListing(symbol));

    // Apply limit if specified
    if (limit && limit > 0 && limit < listings.length) {
      listings = listings.slice(0, limit);
    }

    return listings;
  }

  /**
   * Get stock symbols categorized by industries.
   *
   * @param lang - Language for industry names. Default is 'vi' (Vietnamese).
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Object mapping industry names to lists of stock symbols
   */
  public async symbolsByIndustries(
    lang: string = 'vi',
    showLog: boolean = this.showLog
  ): Promise<Record<string, string[]>> {
    const cacheKey = `symbols_by_industries_${lang}`;

    // Return cached data if available
    if (this.dataCache[cacheKey]) {
      return this.dataCache[cacheKey];
    }

    try {
      // Get all symbols first
      const allSymbols = await this.allSymbols(showLog);

      // Group symbols by industry
      const result: Record<string, string[]> = {};
      for (const symbol of allSymbols) {
        const industryKey = lang === 'vi' ? symbol.industry : symbol.industry; // Should be industryNameEn for English

        if (!result[industryKey]) {
          result[industryKey] = [];
        }

        result[industryKey].push(symbol.ticker);
      }

      // Cache the data
      this.dataCache[cacheKey] = result;
      return result;
    } catch (error) {
      logger.error(`Error getting symbols by industries: ${error}`);
      throw error;
    }
  }

  /**
   * Get stock symbols categorized by exchanges.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Object mapping exchange codes to lists of stock symbols
   */
  public async symbolsByExchange(
    showLog: boolean = this.showLog
  ): Promise<Record<string, string[]>> {
    const cacheKey = 'symbols_by_exchange';

    // Return cached data if available
    if (this.dataCache[cacheKey]) {
      return this.dataCache[cacheKey];
    }

    try {
      // Get all symbols first
      const allSymbols = await this.allSymbols(showLog);

      // Group symbols by exchange
      const result: Record<string, string[]> = {};
      for (const symbol of allSymbols) {
        const exchangeKey = symbol.exchange;

        if (!result[exchangeKey]) {
          result[exchangeKey] = [];
        }

        result[exchangeKey].push(symbol.ticker);
      }

      // Cache the data
      this.dataCache[cacheKey] = result;
      return result;
    } catch (error) {
      logger.error(`Error getting symbols by exchange: ${error}`);
      throw error;
    }
  }

  /**
   * Get stock symbols by group code.
   *
   * @param groupCode - Group code to filter symbols by. Default is 'VN30'.
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns List of stock symbols in the specified group
   */
  public async symbolsByGroup(
    groupCode: string = 'VN30',
    showLog: boolean = this.showLog
  ): Promise<string[]> {
    const cacheKey = `symbols_by_group_${groupCode}`;

    // Return cached data if available
    if (this.dataCache[cacheKey]) {
      return this.dataCache[cacheKey];
    }

    // Validate group code
    if (!_GROUP_CODE.includes(groupCode)) {
      throw new Error(
        `Invalid group code: ${groupCode}. Valid values: ${_GROUP_CODE.join(
          ', '
        )}`
      );
    }

    // GraphQL query to fetch symbols by group
    const payload = {
      query: `query Query($groupCode: String!) {
        CompanyGroup(groupCode: $groupCode) {
          groupCode
          ticker
        }
      }`,
      variables: {
        groupCode,
      },
    };

    if (showLog) {
      logger.info(`Fetching symbols for group: ${groupCode}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.CompanyGroup) {
        return [];
      }

      // Extract tickers
      const tickers = responseData.data.CompanyGroup.map(
        (item: any) => item.ticker
      );

      // Cache the data
      this.dataCache[cacheKey] = tickers;
      return tickers;
    } catch (error) {
      logger.error(`Error fetching symbols by group: ${error}`);
      throw error;
    }
  }

  /**
   * Get all industries using ICB classification.
   *
   * @param level - ICB level to retrieve. Default is null (all levels).
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of industry information objects
   */
  public async industriesIcb(
    level: number | null = null,
    showLog: boolean = this.showLog
  ): Promise<IndustryInfo[]> {
    const cacheKey = `industries_icb_${level}`;

    // Return cached data if available
    if (this.dataCache[cacheKey]) {
      return this.dataCache[cacheKey];
    }

    // GraphQL query to fetch ICB industries
    const payload = {
      query: `query Query {
        ICBIndustries {
          id
          code
          name
          nameEn
          parentId
          level
          childCount
          companyCount
        }
      }`,
      variables: {},
    };

    if (showLog) {
      logger.info('Fetching ICB industries');
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.ICBIndustries) {
        return [];
      }

      // Process industries data
      let industries = responseData.data.ICBIndustries.map(
        (item: any): IndustryInfo => ({
          id: item.id,
          code: item.code,
          name: item.name,
          nameEn: item.nameEn,
          parentId: item.parentId,
          level: item.level,
          childCount: item.childCount,
          companyCount: item.companyCount,
        })
      );

      // Filter by level if specified
      if (level !== null) {
        industries = industries.filter((industry) => industry.level === level);
      }

      // Cache the data
      this.dataCache[cacheKey] = industries;
      return industries;
    } catch (error) {
      logger.error(`Error fetching ICB industries: ${error}`);
      throw error;
    }
  }

  /**
   * Get all future indices.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns List of future indices
   */
  public async allFutureIndices(
    showLog: boolean = this.showLog
  ): Promise<any[]> {
    // Implementation would depend on specific API endpoint for futures
    logger.warning('Future indices functionality is not fully implemented');
    return [];
  }

  /**
   * Get all covered warrants.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns List of covered warrants
   */
  public async allCoveredWarrant(
    showLog: boolean = this.showLog
  ): Promise<string[]> {
    const cacheKey = 'all_covered_warrant';

    // Return cached data if available
    if (this.dataCache[cacheKey]) {
      return this.dataCache[cacheKey];
    }

    // Implementation similar to symbolsByGroup but for CW group
    return this.symbolsByGroup('CW', showLog);
  }

  /**
   * Get all corporate bonds.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns List of corporate bonds
   */
  public async allBonds(showLog: boolean = this.showLog): Promise<string[]> {
    const cacheKey = 'all_bonds';

    // Return cached data if available
    if (this.dataCache[cacheKey]) {
      return this.dataCache[cacheKey];
    }

    // Implementation similar to symbolsByGroup but for BOND group
    return this.symbolsByGroup('BOND', showLog);
  }

  /**
   * Get all government bonds.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns List of government bonds
   */
  public async allGovernmentBonds(
    showLog: boolean = this.showLog
  ): Promise<string[]> {
    // Implementation depends on API support for government bonds
    logger.warning('Government bonds functionality is not fully implemented');
    return [];
  }
}
