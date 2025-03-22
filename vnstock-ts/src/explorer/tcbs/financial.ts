/**
 * TCBS Finance Explorer Module
 */
import axios from 'axios';
import { getLogger } from '../../core/utils/logger';
import { ApiResponse } from '../../types/api';
import {
  TCBS_ENDPOINTS,
  TcbsFinancialPeriod,
  TcbsFinancialStatementType,
  TcbsReportType,
} from './const';
import { BaseExplorer } from '../base';
import { DataSource } from '../../types/config';

const logger = getLogger('tcbs.financial');

/**
 * TCBS Explorer for financial data
 */
export class TcbsFinancialExplorer extends BaseExplorer {
  constructor() {
    super(DataSource.TCBS);
  }

  /**
   * Get financial statements from TCBS data source
   * @param symbol - Stock symbol
   * @param statementType - Type of financial statement (incomestatement, balancesheet, cashflow)
   * @param period - Reporting period (QUARTERLY, YEARLY)
   * @param limit - Maximum number of periods to retrieve
   * @param reportType - Type of report (CONSOLIDATED, SEPARATE)
   * @returns Financial statement data
   */
  async getFinancialStatements(
    symbol: string,
    statementType: string = TcbsFinancialStatementType.INCOME_STATEMENT,
    period: string = TcbsFinancialPeriod.QUARTERLY,
    limit: number = 10,
    reportType: string = TcbsReportType.CONSOLIDATED
  ): Promise<ApiResponse<any>> {
    try {
      if (!symbol) {
        return {
          data: null,
          status: 'error',
          message: 'Symbol is required',
        };
      }

      logger.debug(
        `Getting ${statementType} for ${symbol} (period=${period}, limit=${limit})`
      );

      const validStatementTypes = Object.values(TcbsFinancialStatementType);
      if (
        !validStatementTypes.includes(
          statementType as TcbsFinancialStatementType
        )
      ) {
        return {
          data: {
            symbol,
            statementType,
            period,
            items: [],
            periods: [],
          },
          status: 'error',
          message: `Invalid statement type: ${statementType}. Must be one of ${validStatementTypes.join(
            ', '
          )}`,
        };
      }

      const validPeriods = Object.values(TcbsFinancialPeriod);
      if (!validPeriods.includes(period as TcbsFinancialPeriod)) {
        return {
          data: {
            symbol,
            statementType,
            period,
            items: [],
            periods: [],
          },
          status: 'error',
          message: `Invalid period: ${period}. Must be one of ${validPeriods.join(
            ', '
          )}`,
        };
      }

      const validReportTypes = Object.values(TcbsReportType);
      if (!validReportTypes.includes(reportType as TcbsReportType)) {
        return {
          data: {
            symbol,
            statementType,
            period,
            items: [],
            periods: [],
          },
          status: 'error',
          message: `Invalid report type: ${reportType}. Must be one of ${validReportTypes.join(
            ', '
          )}`,
        };
      }

      const url = `${TCBS_ENDPOINTS.FINANCIAL_STATEMENT}/${symbol}/${statementType}`;
      const params = {
        reportType,
        periodType: period,
        size: limit,
      };

      const response = await axios.get(url, { params });

      if (!response.data) {
        return {
          data: {
            symbol,
            statementType,
            period,
            items: [],
            periods: [],
          },
          status: 'error',
          message: 'No data returned from API',
        };
      }

      // Process the response data
      const items: any[] = [];
      const periods: string[] = [];

      // Extract unique periods from data
      if (response.data && Array.isArray(response.data)) {
        const uniquePeriods = [
          ...new Set(response.data.map((item) => item.periodDate)),
        ];
        periods.push(...uniquePeriods.sort());

        // Group items by name
        const groupedItems: Record<string, any> = {};
        response.data.forEach((item) => {
          if (!groupedItems[item.name]) {
            groupedItems[item.name] = {
              name: item.name,
              values: {},
            };
          }
          groupedItems[item.name].values[item.periodDate] = item.value;
        });

        // Convert grouped items to array
        Object.values(groupedItems).forEach((item) => {
          items.push(item);
        });
      }

      return {
        data: {
          symbol,
          statementType,
          period,
          reportType,
          items,
          periods,
        },
        status: 'success',
        message: 'Successfully retrieved financial statements',
      };
    } catch (error) {
      logger.error(
        `Error fetching financial statements for ${symbol}: ${error}`
      );
      return {
        data: {
          symbol,
          statementType,
          period,
          items: [],
          periods: [],
        },
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get financial ratios from TCBS data source
   * @param symbol - Stock symbol
   * @param period - Reporting period (QUARTERLY, YEARLY)
   * @param limit - Maximum number of periods to retrieve
   * @param reportType - Type of report (CONSOLIDATED, SEPARATE)
   * @returns Financial ratios data
   */
  async getFinancialRatios(
    symbol: string,
    period: string = TcbsFinancialPeriod.QUARTERLY,
    limit: number = 10,
    reportType: string = TcbsReportType.CONSOLIDATED
  ): Promise<ApiResponse<any>> {
    try {
      if (!symbol) {
        return {
          data: null,
          status: 'error',
          message: 'Symbol is required',
        };
      }

      logger.debug(
        `Getting financial ratios for ${symbol} (period=${period}, limit=${limit})`
      );

      const validPeriods = Object.values(TcbsFinancialPeriod);
      if (!validPeriods.includes(period as TcbsFinancialPeriod)) {
        return {
          data: {
            symbol,
            period,
            items: [],
            periods: [],
          },
          status: 'error',
          message: `Invalid period: ${period}. Must be one of ${validPeriods.join(
            ', '
          )}`,
        };
      }

      const validReportTypes = Object.values(TcbsReportType);
      if (!validReportTypes.includes(reportType as TcbsReportType)) {
        return {
          data: {
            symbol,
            period,
            items: [],
            periods: [],
          },
          status: 'error',
          message: `Invalid report type: ${reportType}. Must be one of ${validReportTypes.join(
            ', '
          )}`,
        };
      }

      const url = `${TCBS_ENDPOINTS.FINANCIAL_RATIO}/${symbol}`;
      const params = {
        reportType,
        periodType: period,
        size: limit,
      };

      const response = await axios.get(url, { params });

      if (!response.data) {
        return {
          data: {
            symbol,
            period,
            items: [],
            periods: [],
          },
          status: 'error',
          message: 'No data returned from API',
        };
      }

      // Process the response data
      const items: any[] = [];
      const periods: string[] = [];

      // Extract unique periods from data
      if (response.data && Array.isArray(response.data)) {
        const uniquePeriods = [
          ...new Set(response.data.map((item) => item.periodDate)),
        ];
        periods.push(...uniquePeriods.sort());

        // Group items by name
        const groupedItems: Record<string, any> = {};
        response.data.forEach((item) => {
          if (!groupedItems[item.name]) {
            groupedItems[item.name] = {
              name: item.name,
              values: {},
            };
          }
          groupedItems[item.name].values[item.periodDate] = item.value;
        });

        // Convert grouped items to array
        Object.values(groupedItems).forEach((item) => {
          items.push(item);
        });
      }

      return {
        data: {
          symbol,
          period,
          reportType,
          items,
          periods,
        },
        status: 'success',
        message: 'Successfully retrieved financial ratios',
      };
    } catch (error) {
      logger.error(`Error fetching financial ratios for ${symbol}: ${error}`);
      return {
        data: {
          symbol,
          period,
          items: [],
          periods: [],
        },
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
