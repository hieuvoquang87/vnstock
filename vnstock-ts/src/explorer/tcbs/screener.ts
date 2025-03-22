/**
 * TCBS Screener Explorer Module
 */
import axios from 'axios';
import { getLogger } from '../../core/utils/logger';
import { ApiResponse } from '../../types/api';
import { TCBS_ENDPOINTS, TcbsExchange } from './const';
import { BaseExplorer } from '../base';
import { DataSource } from '../../types/config';

const logger = getLogger('tcbs.screener');

/**
 * Stock filter criteria types
 */
export interface TcbsScreenerCriteria {
  /** Filter by exchange */
  exchange?: TcbsExchange | string;
  /** Filter by industry code */
  icbCode?: string;
  /** Filter by market capitalization range (in billion VND) */
  marketCap?: [number, number];
  /** Filter by price range (in VND) */
  price?: [number, number];
  /** Filter by P/E ratio range */
  pe?: [number, number];
  /** Filter by P/B ratio range */
  pb?: [number, number];
  /** Filter by EPS (TTM) range */
  eps?: [number, number];
  /** Filter by ROE (%) range */
  roe?: [number, number];
  /** Filter by ROA (%) range */
  roa?: [number, number];
  /** Filter by debt-to-equity ratio range */
  debtToEquity?: [number, number];
  /** Filter by dividend yield (%) range */
  dividendYield?: [number, number];
  /** Filter by net revenue growth (%) range */
  netRevenueGrowth?: [number, number];
  /** Filter by profit growth (%) range */
  profitGrowth?: [number, number];
  /** Sort by field */
  orderBy?: string;
  /** Sort direction */
  order?: 'asc' | 'desc';
  /** Maximum number of results */
  limit?: number;
  /** Result page offset */
  offset?: number;
}

/**
 * TCBS Explorer for stock screening
 */
export class TcbsScreenerExplorer extends BaseExplorer {
  constructor() {
    super(DataSource.TCBS);
  }

  /**
   * Screen stocks based on filter criteria
   * @param criteria - Filter criteria
   * @returns Filtered stock list
   */
  async screenStocks(
    criteria: TcbsScreenerCriteria = {},
    limit: number = 50
  ): Promise<ApiResponse<any[]>> {
    try {
      logger.debug(
        `Screening stocks with criteria: ${JSON.stringify(criteria)}`
      );

      // Build filter object for TCBS API
      const filters: Record<string, any> = {};

      // Exchange filter
      if (criteria.exchange) {
        filters.exchange = criteria.exchange;
      }

      // Industry filter
      if (criteria.icbCode) {
        filters.icbCode = criteria.icbCode;
      }

      // Add range filters if provided
      const rangeFilters = [
        'marketCap',
        'price',
        'pe',
        'pb',
        'eps',
        'roe',
        'roa',
        'debtToEquity',
        'dividendYield',
        'netRevenueGrowth',
        'profitGrowth',
      ];

      rangeFilters.forEach((filter) => {
        const value = criteria[filter as keyof TcbsScreenerCriteria] as
          | [number, number]
          | undefined;
        if (value && Array.isArray(value) && value.length === 2) {
          filters[filter] = {
            min: value[0],
            max: value[1],
          };
        }
      });

      // Pagination and sorting
      const requestParams: Record<string, any> = {
        offset: criteria.offset || 0,
        size: criteria.limit || limit,
        orderBy: criteria.orderBy || 'marketCap',
        order: criteria.order || 'desc',
        filter: JSON.stringify(filters),
      };

      const response = await axios.get(TCBS_ENDPOINTS.SCREENER, {
        params: requestParams,
      });

      if (!response.data) {
        return {
          data: [],
          status: 'error',
          message: 'No data returned from API',
        };
      }

      return {
        data: response.data,
        status: 'success',
        message: 'Successfully retrieved screened stocks',
      };
    } catch (error) {
      logger.error(`Error screening stocks: ${error}`);
      return {
        data: [],
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get top stocks by market capitalization
   * @param exchange - Stock exchange (HOSE, HNX, UPCOM)
   * @param limit - Maximum number of results
   * @returns List of top stocks
   */
  async getTopStocks(
    exchange: TcbsExchange | string = TcbsExchange.HOSE,
    limit: number = 20
  ): Promise<ApiResponse<any[]>> {
    return this.screenStocks(
      {
        exchange,
        orderBy: 'marketCap',
        order: 'desc',
        limit,
      },
      limit
    );
  }

  /**
   * Get top growing stocks by revenue
   * @param exchange - Stock exchange (HOSE, HNX, UPCOM)
   * @param limit - Maximum number of results
   * @returns List of top growing stocks by revenue
   */
  async getTopGrowthStocks(
    exchange: TcbsExchange | string = TcbsExchange.HOSE,
    limit: number = 20
  ): Promise<ApiResponse<any[]>> {
    return this.screenStocks(
      {
        exchange,
        orderBy: 'netRevenueGrowth',
        order: 'desc',
        limit,
      },
      limit
    );
  }

  /**
   * Get top dividend stocks
   * @param exchange - Stock exchange (HOSE, HNX, UPCOM)
   * @param limit - Maximum number of results
   * @returns List of top dividend stocks
   */
  async getTopDividendStocks(
    exchange: TcbsExchange | string = TcbsExchange.HOSE,
    limit: number = 20
  ): Promise<ApiResponse<any[]>> {
    return this.screenStocks(
      {
        exchange,
        orderBy: 'dividendYield',
        order: 'desc',
        limit,
        dividendYield: [0.01, 100], // At least 1% dividend yield
      },
      limit
    );
  }

  /**
   * Get top ROE stocks
   * @param exchange - Stock exchange (HOSE, HNX, UPCOM)
   * @param limit - Maximum number of results
   * @returns List of top ROE stocks
   */
  async getTopRoeStocks(
    exchange: TcbsExchange | string = TcbsExchange.HOSE,
    limit: number = 20
  ): Promise<ApiResponse<any[]>> {
    return this.screenStocks(
      {
        exchange,
        orderBy: 'roe',
        order: 'desc',
        limit,
        roe: [0, 100], // 0% to 100% ROE range
      },
      limit
    );
  }
}
