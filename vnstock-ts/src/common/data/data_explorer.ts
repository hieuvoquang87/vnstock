import { getLogger } from '../../core/utils/logger';
import { getAssetType } from '../../core/utils/parser';
import { Config } from './config';

const logger = getLogger('vnstock.common.data.data_explorer');

/**
 * Base component for all data components
 */
export abstract class BaseComponent {
  protected symbol: string | null;
  protected source: string;
  protected sourceModule: string;
  protected dataSource: any;
  protected static SUPPORTED_SOURCES: string[] = [];

  constructor(
    symbol: string | null = null,
    source: string = Config.DEFAULT_SOURCE
  ) {
    this.symbol = symbol ? symbol.toUpperCase() : null;
    this.source = source.toUpperCase();
    this.validateSource();
    this.sourceModule = `vnstock.explorer.${this.source.toLowerCase()}`;
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
export class StockComponents extends BaseComponent {
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
    super(symbol, source);
    this.showLog = showLog;
    this.assetType = getAssetType(this.symbol || '');
    if (!showLog) {
      logger.setLevel(5); // Critical level
    }
    this.initializeComponents();
  }

  private initializeComponents(): void {
    if (this.assetType === 'stock') {
      this.company = new Company(this.symbol, this.source);
      this.finance = new Finance(this.symbol, this.source);
    } else {
      this.company = null;
      this.finance = null;
      logger.info(
        'Không phải là mã chứng khoán, thông tin công ty và tài chính không khả dụng.'
      );
    }

    if (this.source === 'VCI' || this.source === 'TCBS') {
      this.listing = new Listing('VCI');
      this.screener = new Screener('TCBS');
      this.quote = new Quote(this.symbol || '', this.source);
      this.trading = new Trading(this.symbol || '', this.source);

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
      this.quote = new Quote(this.symbol || '', 'MSN');
      this.listing = new Listing('MSN');
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

  constructor(symbol: string, source: string = Config.DEFAULT_SOURCE) {
    super(symbol, source);
  }

  protected loadDataSource(): any {
    try {
      // In TypeScript, we would dynamically import modules
      // However, for this example, we'll simulate the dynamic import
      if (this.source === 'VCI') {
        // This would be a dynamic import in a real implementation
        // return import('../explorer/vci/quote').then(module => new module.Quote(this.symbol));
        return {
          /* VCI Quote implementation */
        };
      } else if (this.source === 'TCBS') {
        return {
          /* TCBS Quote implementation */
        };
      } else if (this.source === 'MSN') {
        return {
          /* MSN Quote implementation */
        };
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  // Implement methods that would delegate to the data source
  public async history(symbol?: string, options?: any): Promise<any> {
    this.updateDataSource(symbol);
    return this.dataSource.history(options);
  }

  public async intraday(symbol?: string, options?: any): Promise<any> {
    this.updateDataSource(symbol);
    return this.dataSource.intraday(options);
  }

  public async priceDepth(symbol?: string, options?: any): Promise<any> {
    this.updateDataSource(symbol);
    return this.dataSource.priceDepth(options);
  }

  private updateDataSource(symbol?: string): void {
    if (symbol) {
      this.symbol = symbol.toUpperCase();
      this.dataSource = this.loadDataSource();
    }
  }
}

/**
 * Listing component for listing data
 */
export class Listing extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['VCI', 'MSN'];

  constructor(source: string = Config.DEFAULT_SOURCE) {
    super(null, source);
  }

  protected loadDataSource(): any {
    try {
      // Simulating dynamic import
      if (this.source === 'VCI') {
        return {
          /* VCI Listing implementation */
        };
      } else if (this.source === 'MSN') {
        return {
          /* MSN Listing implementation */
        };
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  // Cache implementation would be needed here for some methods
  public async allSymbols(options?: any): Promise<any> {
    return this.dataSource.allSymbols(options);
  }

  public async symbolsByIndustries(options?: any): Promise<any> {
    return this.dataSource.symbolsByIndustries(options);
  }

  public async symbolsByExchange(options?: any): Promise<any> {
    return this.dataSource.symbolsByExchange(options);
  }

  public async symbolsByGroup(
    group: string = 'VN30',
    options?: any
  ): Promise<any> {
    return this.dataSource.symbolsByGroup(group, options);
  }

  public async industriesIcb(options?: any): Promise<any> {
    return this.dataSource.industriesIcb(options);
  }

  public async allFutureIndices(options?: any): Promise<any> {
    return this.dataSource.allFutureIndices(options);
  }

  public async allCoveredWarrant(options?: any): Promise<any> {
    return this.dataSource.allCoveredWarrant(options);
  }

  public async allBonds(options?: any): Promise<any> {
    return this.dataSource.allBonds(options);
  }

  public async allGovernmentBonds(options?: any): Promise<any> {
    return this.dataSource.allGovernmentBonds(options);
  }
}

/**
 * Trading component for trading data
 */
export class Trading extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['VCI', 'TCBS'];

  constructor(
    symbol: string | null = 'VN30F1M',
    source: string = Config.DEFAULT_SOURCE
  ) {
    super(symbol, source);
  }

  protected loadDataSource(): any {
    try {
      // Simulating dynamic import
      if (this.source === 'VCI') {
        return {
          /* VCI Trading implementation */
        };
      } else if (this.source === 'TCBS') {
        return {
          /* TCBS Trading implementation */
        };
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
    return this.dataSource.priceBoard(symbolsList, options);
  }
}

/**
 * Company component for company data
 */
export class Company extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['TCBS', 'VCI'];

  constructor(symbol: string | null = 'ACB', source: string = 'TCBS') {
    super(symbol, source);
  }

  protected loadDataSource(): any {
    try {
      // Simulating dynamic import
      if (this.source === 'VCI') {
        return {
          /* VCI Company implementation */
        };
      } else if (this.source === 'TCBS') {
        return {
          /* TCBS Company implementation */
        };
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

  // Cache implementations would be needed for these methods
  public async overview(options?: any): Promise<any> {
    return this.dataSource.overview(options);
  }

  public async profile(options?: any): Promise<any> {
    return this.dataSource.profile(options);
  }

  public async shareholders(options?: any): Promise<any> {
    return this.dataSource.shareholders(options);
  }

  public async insiderDeals(options?: any): Promise<any> {
    return this.dataSource.insiderDeals(options);
  }

  public async subsidiaries(options?: any): Promise<any> {
    return this.dataSource.subsidiaries(options);
  }

  public async officers(options?: any): Promise<any> {
    return this.dataSource.officers(options);
  }

  public async events(options?: any): Promise<any> {
    return this.dataSource.events(options);
  }

  public async news(options?: any): Promise<any> {
    return this.dataSource.news(options);
  }

  public async dividends(options?: any): Promise<any> {
    return this.dataSource.dividends(options);
  }
}

/**
 * Finance component for financial data
 */
export class Finance extends BaseComponent {
  public static SUPPORTED_SOURCES: string[] = ['TCBS', 'VCI'];
  public static SUPPORTED_PERIODS: string[] = ['quarter', 'annual'];

  constructor(symbol: string | null = 'ACB', source: string = 'TCBS') {
    super(symbol, source);
  }

  protected loadDataSource(): any {
    try {
      // Simulating dynamic import
      if (this.source === 'VCI') {
        return {
          /* VCI Finance implementation */
        };
      } else if (this.source === 'TCBS') {
        return {
          /* TCBS Finance implementation */
        };
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  // Cache implementations would be needed for these methods
  public async balanceSheet(
    period: string = 'quarter',
    lang: string = 'vi',
    dropna: boolean = true
  ): Promise<any> {
    this.validatePeriod(period);
    return this.dataSource.balanceSheet(period, lang, dropna);
  }

  public async incomeStatement(
    period: string = 'quarter',
    lang: string = 'vi',
    dropna: boolean = true
  ): Promise<any> {
    this.validatePeriod(period);
    return this.dataSource.incomeStatement(period, lang, dropna);
  }

  public async cashFlow(
    period: string = 'quarter',
    lang: string = 'vi',
    dropna: boolean = true
  ): Promise<any> {
    this.validatePeriod(period);
    return this.dataSource.cashFlow(period, lang, dropna);
  }

  public async ratio(
    period: string = 'quarter',
    lang: string = 'vi',
    dropna: boolean = true
  ): Promise<any> {
    this.validatePeriod(period);
    return this.dataSource.ratio(period, lang, dropna);
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
    super(null, source);
  }

  protected loadDataSource(): any {
    try {
      // Simulating dynamic import
      if (this.source === 'TCBS') {
        return {
          /* TCBS Screener implementation */
        };
      }
    } catch (error) {
      logger.error(`Failed to load data source: ${error}`);
      throw error;
    }
  }

  public async stock(params: any = {}, limit: number = 1700): Promise<any> {
    return this.dataSource.stock(params, limit);
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
    super(symbol, source);
    this.showLog = showLog;
    this.assetType = getAssetType(this.symbol || '');
    this.quote = new Quote(this.symbol || '', source);
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
    super(null, source);
  }

  protected loadDataSource(): any {
    try {
      // Simulating dynamic import
      if (this.source === 'FMARKET') {
        return {
          /* FMARKET Fund implementation */
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
