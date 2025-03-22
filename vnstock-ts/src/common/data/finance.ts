/**
 * Financial data module
 */
import { VciExplorer } from '../../explorer/vci';
import { TcbsExplorer } from '../../explorer/tcbs';
import { ApiResponse } from '../../types/api';
import {
  FinancialStatement,
  FinancialRatio,
  FinancialPeriod,
  FinancialStatementType,
} from '../../types/models';
import { getLogger } from '../../core/utils/logger';
import { DataSource } from '../../types/config';

const logger = getLogger('FinanceModule');

/**
 * Finance module for accessing financial data
 */
export class FinanceModule {
  private vciExplorer: VciExplorer;
  private tcbsExplorer: TcbsExplorer;
  private currentSource: DataSource;

  /**
   * Constructor
   * @param source - Data source to use
   */
  constructor(source: DataSource = DataSource.VCI) {
    this.vciExplorer = new VciExplorer();
    this.tcbsExplorer = new TcbsExplorer();
    this.currentSource = source;

    logger.debug(`Initialized FinanceModule with source: ${source}`);
  }

  /**
   * Get income statement
   * @param symbol - Stock symbol
   * @param period - Reporting period (quarterly or yearly)
   * @param limit - Number of periods to return
   * @returns Income statement data
   */
  public async getIncomeStatement(
    symbol: string,
    period: keyof typeof FinancialPeriod = 'QUARTERLY',
    limit = 4
  ): Promise<ApiResponse<FinancialStatement>> {
    logger.info(`Getting income statement for ${symbol}, period: ${period}`);

    const periodStr = period.toLowerCase();

    if (this.currentSource === DataSource.VCI) {
      return this.vciExplorer.getFinancialStatements(
        symbol,
        'income_statement',
        periodStr,
        limit
      );
    } else if (this.currentSource === DataSource.TCBS) {
      return this.tcbsExplorer.getFinancialStatements(
        symbol,
        'incomestatement',
        periodStr,
        limit
      );
    }

    throw new Error(
      `Unsupported data source for income statement: ${this.currentSource}`
    );
  }

  /**
   * Get balance sheet
   * @param symbol - Stock symbol
   * @param period - Reporting period (quarterly or yearly)
   * @param limit - Number of periods to return
   * @returns Balance sheet data
   */
  public async getBalanceSheet(
    symbol: string,
    period: keyof typeof FinancialPeriod = 'QUARTERLY',
    limit = 4
  ): Promise<ApiResponse<FinancialStatement>> {
    logger.info(`Getting balance sheet for ${symbol}, period: ${period}`);

    const periodStr = period.toLowerCase();

    if (this.currentSource === DataSource.VCI) {
      return this.vciExplorer.getFinancialStatements(
        symbol,
        'balance_sheet',
        periodStr,
        limit
      );
    } else if (this.currentSource === DataSource.TCBS) {
      return this.tcbsExplorer.getFinancialStatements(
        symbol,
        'balancesheet',
        periodStr,
        limit
      );
    }

    throw new Error(
      `Unsupported data source for balance sheet: ${this.currentSource}`
    );
  }

  /**
   * Get cash flow statement
   * @param symbol - Stock symbol
   * @param period - Reporting period (quarterly or yearly)
   * @param limit - Number of periods to return
   * @returns Cash flow statement data
   */
  public async getCashFlow(
    symbol: string,
    period: keyof typeof FinancialPeriod = 'QUARTERLY',
    limit = 4
  ): Promise<ApiResponse<FinancialStatement>> {
    logger.info(`Getting cash flow statement for ${symbol}, period: ${period}`);

    const periodStr = period.toLowerCase();

    if (this.currentSource === DataSource.VCI) {
      return this.vciExplorer.getFinancialStatements(
        symbol,
        'cash_flow',
        periodStr,
        limit
      );
    } else if (this.currentSource === DataSource.TCBS) {
      return this.tcbsExplorer.getFinancialStatements(
        symbol,
        'cashflow',
        periodStr,
        limit
      );
    }

    throw new Error(
      `Unsupported data source for cash flow: ${this.currentSource}`
    );
  }

  /**
   * Get financial statement by type
   * @param symbol - Stock symbol
   * @param type - Statement type
   * @param period - Reporting period (quarterly or yearly)
   * @param limit - Number of periods to return
   * @returns Financial statement data
   */
  public async getFinancialStatement(
    symbol: string,
    type: keyof typeof FinancialStatementType,
    period: keyof typeof FinancialPeriod = 'QUARTERLY',
    limit = 4
  ): Promise<ApiResponse<FinancialStatement>> {
    logger.info(`Getting ${type} for ${symbol}, period: ${period}`);

    switch (type) {
      case 'INCOME':
        return this.getIncomeStatement(symbol, period, limit);
      case 'BALANCE':
        return this.getBalanceSheet(symbol, period, limit);
      case 'CASH_FLOW':
        return this.getCashFlow(symbol, period, limit);
      default:
        throw new Error(`Unknown financial statement type: ${type}`);
    }
  }

  /**
   * Get financial ratios
   * @param symbol - Stock symbol
   * @param period - Reporting period (quarterly or yearly)
   * @param limit - Number of periods to return
   * @returns Financial ratios data
   */
  public async getFinancialRatios(
    symbol: string,
    period: keyof typeof FinancialPeriod = 'QUARTERLY',
    limit = 4
  ): Promise<ApiResponse<FinancialRatio>> {
    logger.info(`Getting financial ratios for ${symbol}, period: ${period}`);

    const periodStr = period.toLowerCase();

    if (this.currentSource === DataSource.TCBS) {
      return this.tcbsExplorer.getFinancialRatios(symbol, periodStr, limit);
    }

    throw new Error(
      `Unsupported data source for financial ratios: ${this.currentSource}`
    );
  }

  /**
   * Change the data source
   * @param source - Data source to use
   */
  public setDataSource(source: DataSource): void {
    this.currentSource = source;
    this.vciExplorer.setSource(source);
    this.tcbsExplorer.setSource(source);
    logger.info(`Changed data source to ${source}`);
  }

  /**
   * Get the current data source
   * @returns Current data source
   */
  public getDataSource(): DataSource {
    return this.currentSource;
  }
}
