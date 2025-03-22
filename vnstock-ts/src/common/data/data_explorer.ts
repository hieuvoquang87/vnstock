import { getLogger } from '../../core/utils/logger';
import { getAssetType } from '../../core/utils/parser';
import { Config } from './config';

// Import explorers - use only properly exported classes for now
import { VciExplorer } from '../../explorer/vci';
import { TcbsExplorer } from '../../explorer/tcbs';
import { MsnExplorer } from '../../explorer/msn';

const vciExplorer = new VciExplorer();
const tcbsExplorer = new TcbsExplorer();
const msnExplorer = new MsnExplorer();

const logger = getLogger('vnstock.common.data.data_explorer');

/**
 * Base component for all data components
 */
export abstract class BaseComponent {
  protected symbol: string | null;
  protected source: string;
  protected dataSource: any;
  protected static SUPPORTED_SOURCES: string[] = [];

  constructor(
    source: string = Config.DEFAULT_SOURCE,
    symbol: string | null = null
  ) {
    this.symbol = symbol ? symbol.toUpperCase() : null;
    this.source = source.toUpperCase();
    this.validateSource();
    this.dataSource = this.loadDataSource();
  }

  protected validateSource(): void {
    const supportedSources = (this.constructor as typeof BaseComponent)
      .SUPPORTED_SOURCES;
    if (!supportedSources.includes(this.source)) {
      throw new Error(
        `Chỉ có nguồn dữ liệu từ ${supportedSources.join(', ')} được hỗ trợ.`
      );
    }
  }

  protected abstract loadDataSource(): any;
}

/**
 * Main component that manages multiple data components for a stock
 */
export class DataExplorer extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['VCI', 'TCBS', 'MSN'];

  public company!: Company | null;
  public finance!: Finance | null;
  public listing!: Listing | null;
  public screener!: Screener | null;
  public quote!: Quote | null;
  public trading!: Trading | null;
  private assetType: string;
  private showLog: boolean;

  constructor(
    symbol: string,
    source: string = Config.DEFAULT_SOURCE,
    showLog: boolean = true
  ) {
    super(source, symbol);
    this.showLog = showLog;
    this.assetType = getAssetType(this.symbol || '');
    if (!showLog) {
      logger.setLevel(5); // Critical level
    }
    this.initializeComponents();
  }

  private initializeComponents(): void {
    if (this.assetType === 'stock') {
      this.company = new Company(this.source, this.symbol);
      this.finance = new Finance(this.source, this.symbol);
    } else {
      this.company = null;
      this.finance = null;
      logger.info(
        'Không phải là mã chứng khoán, thông tin công ty và tài chính không khả dụng.'
      );
    }

    if (this.source === 'VCI' || this.source === 'TCBS') {
      this.listing = new Listing(this.source);
      this.screener = this.source === 'TCBS' ? new Screener(this.source) : null;
      this.quote = new Quote(this.source, this.symbol || '');
      this.trading = new Trading(this.source, this.symbol || '');

      if (this.source === 'TCBS') {
        logger.info(
          'TCBS không cung cấp thông tin danh sách. Dữ liệu tự động trả về từ VCI.'
        );
      } else if (this.source === 'VCI') {
        logger.info(
          'VCI không hỗ trợ kiểm tra cổ phiếu. Dữ liệu tự động trả về từ TCBS.'
        );
      }
    } else if (this.source === 'MSN') {
      this.quote = new Quote(this.source, this.symbol || '');
      this.listing = new Listing(this.source);
      this.screener = null;
      this.trading = null;
    } else {
      this.quote = null;
      this.listing = null;
      this.screener = null;
      this.trading = null;
    }
  }

  protected loadDataSource(): any {
    // This class doesn't need to load a specific data source
    // Instead, it initializes multiple components
    return this;
  }

  public updateSymbol(symbol: string): void {
    this.symbol = symbol.toUpperCase();
    this.initializeComponents();
  }
}

/**
 * Quote component for historical price data
 */
export class Quote extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['VCI', 'TCBS', 'MSN'];

  constructor(
    source: string = Config.DEFAULT_SOURCE,
    symbol: string | null = null
  ) {
    super(source, symbol);
  }

  protected loadDataSource(): any {
    try {
      // Load the appropriate Quote class based on the source
      if (this.source === 'VCI') {
        return vciExplorer.quoteExplorer;
      } else if (this.source === 'TCBS') {
        return tcbsExplorer.quoteExplorer;
      } else if (this.source === 'MSN') {
        logger.warning(
          'MSN Explorer Quote module is not fully implemented yet'
        );
        // Fallback to VCI explorer temporarily
        return vciExplorer.quoteExplorer;
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  // Implement methods that would delegate to the data source
  public async history(symbol?: string, options?: any): Promise<any> {
    this.updateDataSource(symbol);
    return this.dataSource.history(this.symbol, options);
  }

  public async intraday(symbol?: string, options?: any): Promise<any> {
    this.updateDataSource(symbol);
    return this.dataSource.intraday(this.symbol, options);
  }

  public async priceDepth(symbol?: string, options?: any): Promise<any> {
    this.updateDataSource(symbol);
    return this.dataSource.priceDepth(this.symbol, options);
  }

  private updateDataSource(symbol?: string): void {
    if (symbol) {
      this.symbol = symbol.toUpperCase();
      this.dataSource = this.loadDataSource();
    }

    if (!this.symbol) {
      throw new Error('Symbol is required for this operation');
    }
  }
}

/**
 * Listing component for listing data
 */
export class Listing extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['VCI', 'TCBS', 'MSN'];

  constructor(source: string = Config.DEFAULT_SOURCE) {
    super(source);
  }

  protected loadDataSource(): any {
    try {
      // Use the unified explorer classes for now
      if (this.source === 'VCI') {
        return vciExplorer.listingExplorer;
      } else if (this.source === 'TCBS') {
        return tcbsExplorer.listingExplorer;
      } else if (this.source === 'MSN') {
        logger.warning(
          'MSN Explorer Listing module is not fully implemented yet'
        );
        // Fallback to VCI explorer temporarily
        return vciExplorer.listingExplorer;
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  // Cache implementation would be needed here for some methods
  public async allSymbols(options?: any): Promise<any> {
    return this.dataSource.getListing
      ? this.dataSource.getListing(options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async symbolsByIndustries(options?: any): Promise<any> {
    return this.dataSource.getStocksByIndustry
      ? this.dataSource.getStocksByIndustry(options)
      : this.dataSource.getListing(options);
  }

  public async symbolsByExchange(options?: any): Promise<any> {
    return this.dataSource.getStocksByExchange
      ? this.dataSource.getStocksByExchange(options)
      : this.dataSource.getListing(options);
  }

  public async symbolsByGroup(
    group: string = 'VN30',
    options?: any
  ): Promise<any> {
    return this.dataSource.symbolsByGroup
      ? this.dataSource.symbolsByGroup(group, options)
      : this.dataSource.getListing(options);
  }

  public async industriesIcb(options?: any): Promise<any> {
    return this.dataSource.getIndustries
      ? this.dataSource.getIndustries(options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async allFutureIndices(options?: any): Promise<any> {
    return this.dataSource.allFutureIndices
      ? this.dataSource.allFutureIndices(options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async allCoveredWarrant(options?: any): Promise<any> {
    return this.dataSource.allCoveredWarrant
      ? this.dataSource.allCoveredWarrant(options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async allBonds(options?: any): Promise<any> {
    return this.dataSource.allBonds
      ? this.dataSource.allBonds(options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async allGovernmentBonds(options?: any): Promise<any> {
    return this.dataSource.allGovernmentBonds
      ? this.dataSource.allGovernmentBonds(options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }
}

/**
 * Trading component for trading data
 */
export class Trading extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['VCI', 'TCBS'];

  constructor(
    source: string = Config.DEFAULT_SOURCE,
    symbol: string | null = 'VN30F1M'
  ) {
    super(source, symbol);
  }

  protected loadDataSource(): any {
    try {
      // Use the unified explorer classes for now
      if (this.source === 'VCI') {
        return vciExplorer.tradingExplorer;
      } else if (this.source === 'TCBS') {
        return tcbsExplorer.tradingExplorer;
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  private updateDataSource(symbol?: string): void {
    if (symbol) {
      this.symbol = symbol.toUpperCase();
      this.dataSource = this.loadDataSource();
    }
  }

  public async priceBoard(symbolsList: string[], options?: any): Promise<any> {
    return this.dataSource.getPriceBoard
      ? this.dataSource.getPriceBoard(symbolsList, options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }
}

/**
 * Company component for company data
 */
export class Company extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['TCBS', 'VCI'];

  constructor(source: string = 'TCBS', symbol: string | null = 'ACB') {
    super(source, symbol);
  }

  protected loadDataSource(): any {
    try {
      // Use the unified explorer classes for now
      if (this.source === 'VCI') {
        return vciExplorer.companyExplorer;
      } else if (this.source === 'TCBS') {
        return tcbsExplorer.companyExplorer;
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  private updateDataSource(symbol?: string): void {
    if (symbol) {
      this.symbol = symbol.toUpperCase();
      this.dataSource = this.loadDataSource();
    }

    if (!this.symbol) {
      throw new Error('Symbol is required for company operations');
    }
  }

  // Update methods to match the specialized explorer implementations
  public async profile(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for company profile');
    }
    return this.dataSource.getCompanyProfile(this.symbol, options);
  }

  public async overview(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for company overview');
    }
    return this.dataSource.getCompanyProfile
      ? this.dataSource.getCompanyProfile(this.symbol, options)
      : { data: null, status: 'error', message: 'Method not implemented' };
  }

  public async shareholders(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for shareholders data');
    }
    return this.dataSource.getMajorShareholders
      ? this.dataSource.getMajorShareholders(this.symbol, options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async insiderDeals(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for insider deals data');
    }
    return this.dataSource.getInsiderDeals
      ? this.dataSource.getInsiderDeals(this.symbol, options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async subsidiaries(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for subsidiaries data');
    }
    return this.dataSource.getCompanySubsidiaries
      ? this.dataSource.getCompanySubsidiaries(this.symbol, options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async officers(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for officers data');
    }
    return this.dataSource.getCompanyExecutives
      ? this.dataSource.getCompanyExecutives(this.symbol, options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async events(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for events data');
    }
    return this.dataSource.getEvents
      ? this.dataSource.getEvents(this.symbol, options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async news(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for news data');
    }
    return this.dataSource.getNews
      ? this.dataSource.getNews(this.symbol, options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async dividends(options?: any): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for dividends data');
    }
    return this.dataSource.getDividendHistory
      ? this.dataSource.getDividendHistory(this.symbol, options)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }
}

/**
 * Finance component for financial data
 */
export class Finance extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['TCBS', 'VCI'];
  public static SUPPORTED_PERIODS: string[] = ['quarter', 'annual'];

  constructor(source: string = 'TCBS', symbol: string | null = 'ACB') {
    super(source, symbol);
  }

  protected loadDataSource(): any {
    try {
      // Use the unified explorer classes for now
      if (this.source === 'VCI') {
        return vciExplorer.financialExplorer;
      } else if (this.source === 'TCBS') {
        return tcbsExplorer.financialExplorer;
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  // Update methods to match the specialized explorer implementations
  public async balanceSheet(
    period: string = 'quarter',
    lang: string = 'vi',
    dropna: boolean = true
  ): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for balance sheet data');
    }
    this.validatePeriod(period);
    return this.dataSource.getFinancialStatements
      ? this.dataSource.getFinancialStatements(
          this.symbol,
          'balancesheet',
          period,
          10
        )
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async incomeStatement(
    period: string = 'quarter',
    lang: string = 'vi',
    dropna: boolean = true
  ): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for income statement data');
    }
    this.validatePeriod(period);
    return this.dataSource.getFinancialStatements
      ? this.dataSource.getFinancialStatements(
          this.symbol,
          'incomestatement',
          period,
          10
        )
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async cashFlow(
    period: string = 'quarter',
    lang: string = 'vi',
    dropna: boolean = true
  ): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for cash flow data');
    }
    this.validatePeriod(period);
    return this.dataSource.getFinancialStatements
      ? this.dataSource.getFinancialStatements(
          this.symbol,
          'cashflow',
          period,
          10
        )
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  public async ratio(
    period: string = 'quarter',
    lang: string = 'vi',
    dropna: boolean = true
  ): Promise<any> {
    if (!this.symbol) {
      throw new Error('Symbol is required for financial ratio data');
    }
    this.validatePeriod(period);
    return this.dataSource.getFinancialRatios
      ? this.dataSource.getFinancialRatios(this.symbol, period, 10)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }

  private validatePeriod(period: string): void {
    if (!Finance.SUPPORTED_PERIODS.includes(period)) {
      throw new Error(
        `Period must be one of: ${Finance.SUPPORTED_PERIODS.join(', ')}`
      );
    }
  }
}

/**
 * Screener component for screening stocks
 */
export class Screener extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['TCBS'];

  constructor(source: string = 'TCBS') {
    super(source);
  }

  protected loadDataSource(): any {
    try {
      // Use the unified explorer classes for now
      if (this.source === 'TCBS') {
        return tcbsExplorer.screenerExplorer;
      } else {
        logger.warning(
          `${this.source} does not support screener functionality`
        );
        // Default to TCBS as it's the only supported source
        return tcbsExplorer.screenerExplorer;
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  public async stock(params: any = {}, limit: number = 1700): Promise<any> {
    return this.dataSource.screenStocks
      ? this.dataSource.screenStocks(params, limit)
      : { data: [], status: 'error', message: 'Method not implemented' };
  }
}

/**
 * Components for MSN data source
 */
export class MSNComponents extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['MSN'];

  public quote!: Quote | null;
  private assetType: string;
  private showLog: boolean;

  constructor(symbol: string, source: string = 'MSN', showLog: boolean = true) {
    super(source, symbol);
    this.showLog = showLog;
    this.assetType = getAssetType(this.symbol || '');
    this.quote = new Quote(source, this.symbol);
  }

  protected loadDataSource(): any {
    // This class doesn't need to load a specific data source
    return this;
  }
}

/**
 * Fund component for fund data
 */
export class Fund extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['FMARKET'];

  constructor(source: string = 'FMARKET') {
    super(source);
  }

  protected loadDataSource(): any {
    try {
      // For now, since we don't have a FMARKET explorer implementation,
      // we'll return a minimal implementation
      if (this.source === 'FMARKET') {
        logger.warning('FMARKET Explorer is not yet implemented');
        return {
          listing: () => {
            return Promise.resolve({
              data: [],
              status: 'error',
              message: 'FMARKET Explorer is not yet implemented',
            });
          },
        };
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  public async listing(): Promise<any> {
    return this.dataSource.listing();
  }
}
