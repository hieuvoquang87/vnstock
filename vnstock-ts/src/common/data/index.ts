/**
 * Data module exports
 */

// Export DataExplorer as main class
export * from './data_explorer';

// Export specific modules for Vnstock class
import { Quote, Listing, Company, Finance } from './data_explorer';
import { DataSource } from '../../types/config';

export class QuoteModule extends Quote {
  constructor(source = 'VCI') {
    // Default symbol required by Quote class
    super(source, 'VN30');
  }

  // Add getQuote method to match example usage
  async getQuote(symbol: string, options?: any): Promise<any> {
    // Update the symbol
    this.symbol = symbol.toUpperCase();
    // Call the correct method on the data source
    if (this.dataSource && typeof this.dataSource.getQuote === 'function') {
      return this.dataSource.getQuote(symbol);
    } else if (
      this.dataSource &&
      typeof this.dataSource.getHistoricalOHLC === 'function'
    ) {
      // Fallback to historical data if getQuote is not available
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      return this.dataSource.getHistoricalOHLC(
        symbol,
        thirtyDaysAgo,
        today,
        '1D'
      );
    }
    throw new Error(
      `Method getQuote not supported by data source ${this.source}`
    );
  }

  // Override to allow symbol-less operations
  async history(symbol: string, options?: any): Promise<any> {
    this.symbol = symbol.toUpperCase();
    if (
      this.dataSource &&
      typeof this.dataSource.getHistoricalOHLC === 'function'
    ) {
      const today = new Date().toISOString().split('T')[0];
      const startDate =
        options?.startDate ||
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
      const endDate = options?.endDate || today;
      const resolution = options?.resolution || '1D';
      return this.dataSource.getHistoricalOHLC(
        symbol,
        startDate,
        endDate,
        resolution
      );
    }
    throw new Error(
      `Method history not supported by data source ${this.source}`
    );
  }

  async intraday(symbol: string, options?: any): Promise<any> {
    this.symbol = symbol.toUpperCase();
    if (this.dataSource && typeof this.dataSource.getIntraday === 'function') {
      const resolution = options?.resolution || 1;
      return this.dataSource.getIntraday(symbol, resolution);
    }
    throw new Error(
      `Method intraday not supported by data source ${this.source}`
    );
  }

  async priceDepth(symbol: string, options?: any): Promise<any> {
    this.symbol = symbol.toUpperCase();
    if (typeof super.priceDepth === 'function') {
      return super.priceDepth(options);
    }
    throw new Error(
      `Method priceDepth not supported by data source ${this.source}`
    );
  }

  setDataSource(source: DataSource): void {
    this.source = source.toString();
  }
}

export class ListingModule extends Listing {
  constructor(source = 'VCI') {
    super(source);
  }

  setDataSource(source: DataSource): void {
    this.source = source.toString();
  }
}

export class CompanyModule extends Company {
  constructor(source = 'TCBS') {
    super(source, 'VNM');
  }

  // Add getCompanyProfile method to match example usage
  async getCompanyProfile(symbol: string, options?: any): Promise<any> {
    this.symbol = symbol.toUpperCase();
    return super.profile(options);
  }

  setDataSource(source: DataSource): void {
    this.source = source.toString();
  }
}

export class FinanceModule extends Finance {
  constructor(source = 'TCBS') {
    super(source, 'VNM');
  }

  setDataSource(source: DataSource): void {
    this.source = source.toString();
  }
}
