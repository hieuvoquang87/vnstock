/**
 * TCBS Explorer Module
 * Export all modules from TCBS data source
 */

// Export constants
export * from './const';

// Export models
export * from './models';

// Create a unified TcbsExplorer class
import { TcbsExplorer as QuoteTcbsExplorer } from './quote';
import { TcbsExplorer as ListingTcbsExplorer } from './listing';
import { TcbsExplorer as CompanyTcbsExplorer } from './company';
import { BaseExplorer } from '../base';
import { ApiResponse, PaginationParams } from '../../types/api';
import { DataSource } from '../../types/config';
import { StockListing } from '../../types/models';

// Create a unified TcbsExplorer class that combines all functionality
export class TcbsExplorer extends BaseExplorer {
  private quoteExplorer: QuoteTcbsExplorer;
  private listingExplorer: ListingTcbsExplorer;
  private companyExplorer: CompanyTcbsExplorer;

  constructor() {
    super(DataSource.TCBS);
    this.quoteExplorer = new QuoteTcbsExplorer();
    this.listingExplorer = new ListingTcbsExplorer();
    this.companyExplorer = new CompanyTcbsExplorer();
  }

  // Required getListing and getFilteredListing methods
  async getListing(
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    // Forward to the listing explorer
    const result = await this.listingExplorer.getStockListings({
      limit: params?.limit,
      offset: params?.offset,
    });

    // Convert to common StockListing format if needed
    const standardizedData = result.data.map(
      (item) =>
        ({
          symbol: item.symbol,
          companyName: item.companyName,
          exchange: item.exchange,
          industry: item.industry || '',
          sector: item.sector || '',
          shortName: item.symbol,
          fullName: item.companyName,
          industryCode: item.industryCode || '',
          sectorCode: '',
          marketCap: item.marketCap || 0,
          sharesOutstanding: item.shareOutstanding || 0,
          listedDate: item.listedDate || '',
          status: 'active',
        } as StockListing)
    );

    return {
      data: standardizedData,
      status: result.status,
      message: result.message,
    };
  }

  async getFilteredListing(
    exchange?: string,
    industry?: string | number,
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    try {
      // Forward to the listing explorer
      let result;

      if (exchange && industry) {
        result = await this.listingExplorer.getStockListings({
          exchange: exchange as any, // Type conversion handled by implementation
          industryCode: industry?.toString(),
          limit: params?.limit,
          offset: params?.offset,
        });
      } else if (exchange) {
        result = await this.listingExplorer.getStockListings({
          exchange: exchange as any,
          limit: params?.limit,
          offset: params?.offset,
        });
      } else if (industry) {
        result = await this.listingExplorer.getStockListings({
          industryCode: industry?.toString(),
          limit: params?.limit,
          offset: params?.offset,
        });
      } else {
        result = await this.listingExplorer.getStockListings({
          limit: params?.limit,
          offset: params?.offset,
        });
      }

      // Convert to common StockListing format
      const standardizedData = result.data.map(
        (item) =>
          ({
            symbol: item.symbol,
            companyName: item.companyName,
            exchange: item.exchange,
            industry: item.industry || '',
            sector: item.sector || '',
            shortName: item.symbol,
            fullName: item.companyName,
            industryCode: item.industryCode || '',
            sectorCode: '',
            marketCap: item.marketCap || 0,
            sharesOutstanding: item.shareOutstanding || 0,
            listedDate: item.listedDate || '',
            status: 'active',
          } as StockListing)
      );

      return {
        data: standardizedData,
        status: result.status,
        message: result.message,
      };
    } catch (error) {
      return {
        data: [],
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Forward quote methods to quote explorer
  getQuote(symbol: string) {
    return this.quoteExplorer.getQuote(symbol);
  }

  getQuotes(symbols: string[]) {
    return this.quoteExplorer.getQuotes(symbols);
  }

  getIntraday(symbol: string, date?: string) {
    return this.quoteExplorer.getIntraday(symbol, date);
  }

  getHistoricalOHLC(symbol: string, params: any) {
    return this.quoteExplorer.getHistoricalOHLC(symbol, params);
  }

  getDailyOHLC(symbol: string, fromDate: string, toDate: string) {
    return this.quoteExplorer.getDailyOHLC(symbol, fromDate, toDate);
  }

  getWeeklyOHLC(symbol: string, fromDate: string, toDate: string) {
    return this.quoteExplorer.getWeeklyOHLC(symbol, fromDate, toDate);
  }

  getMonthlyOHLC(symbol: string, fromDate: string, toDate: string) {
    return this.quoteExplorer.getMonthlyOHLC(symbol, fromDate, toDate);
  }

  // Forward company methods to company explorer
  getCompanyProfile(symbol: string) {
    return this.companyExplorer.getCompanyProfile(symbol);
  }

  getOwnershipStructure(symbol: string) {
    return this.companyExplorer.getOwnershipStructure(symbol);
  }

  getMajorShareholders(symbol: string) {
    return this.companyExplorer.getMajorShareholders(symbol);
  }

  getCompanyExecutives(symbol: string) {
    return this.companyExplorer.getCompanyExecutives(symbol);
  }

  getCompanySubsidiaries(symbol: string) {
    return this.companyExplorer.getCompanySubsidiaries(symbol);
  }

  getBusinessModel(symbol: string) {
    return this.companyExplorer.getBusinessModel(symbol);
  }

  getDividendHistory(symbol: string) {
    return this.companyExplorer.getDividendHistory(symbol);
  }

  // Forward listing methods to listing explorer
  getStockListings(params: any) {
    return this.listingExplorer.getStockListings(params);
  }

  getAllStockListings() {
    return this.listingExplorer.getAllStockListings();
  }

  getStocksByExchange(exchange: any, limit: number) {
    return this.listingExplorer.getStocksByExchange(exchange, limit);
  }

  getStocksByIndustry(industryCode: string, limit: number) {
    return this.listingExplorer.getStocksByIndustry(industryCode, limit);
  }

  getHoseStocks(limit: number) {
    return this.listingExplorer.getHoseStocks(limit);
  }

  getHnxStocks(limit: number) {
    return this.listingExplorer.getHnxStocks(limit);
  }

  getUpcomStocks(limit: number) {
    return this.listingExplorer.getUpcomStocks(limit);
  }

  getIndustries() {
    return this.listingExplorer.getIndustries();
  }

  // Forward financial methods to the appropriate implementations
  async getFinancialStatements(
    symbol: string,
    statementType: string,
    period: string,
    limit: number
  ): Promise<ApiResponse<any>> {
    // This would normally call a method in a financial.ts implementation
    // For now, return a placeholder response
    return {
      data: {
        symbol,
        statementType,
        period,
        items: [],
        periods: [],
      },
      status: 'error',
      message: 'Financial statements not fully implemented yet',
    };
  }

  async getFinancialRatios(
    symbol: string,
    period: string,
    limit: number
  ): Promise<ApiResponse<any>> {
    // This would normally call a method in a financial.ts implementation
    // For now, return a placeholder response
    return {
      data: {
        symbol,
        period,
        items: [],
        periods: [],
      },
      status: 'error',
      message: 'Financial ratios not fully implemented yet',
    };
  }
}

// Remove this placeholder as we now have a proper implementation
// export const placeholder = 'TCBS Explorer Placeholder';
