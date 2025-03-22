/**
 * TCBS Explorer Listing Implementation
 */
import { ApiResponse } from '../../types/api';
import { BaseExplorer } from '../base';
import { TcbsResponse, TcbsStockListing } from './models';
import { TCBS_ENDPOINTS, TcbsExchange } from './const';

/**
 * Parameters for stock listing request
 */
interface ListingParams {
  exchange?: TcbsExchange;
  industryCode?: string;
  limit?: number;
  offset?: number;
}

/**
 * TCBS Listing functionality
 */
export class TcbsExplorer extends BaseExplorer {
  /**
   * Get stock listings with filtering options
   *
   * @param params Listing parameters
   * @returns Promise resolving to stock listing data
   */
  async getStockListings(
    params: ListingParams = {}
  ): Promise<ApiResponse<TcbsStockListing[]>> {
    const queryParams = new URLSearchParams();

    if (params.exchange) {
      queryParams.append('exchange', params.exchange);
    }

    if (params.industryCode) {
      queryParams.append('industryCode', params.industryCode);
    }

    if (params.limit) {
      if (params.limit < 1 || params.limit > 5000) {
        throw new Error('Limit must be between 1 and 5000');
      }
      queryParams.append('limit', params.limit.toString());
    } else {
      queryParams.append('limit', '3000'); // Default limit
    }

    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `${this.buildUrl(
      TCBS_ENDPOINTS.LISTING
    )}?${queryParams.toString()}`;

    const response = await this.request<TcbsResponse<TcbsStockListing[]>>({
      url,
      method: 'GET',
    });

    return {
      data: response.data.data,
      status: response.data.status === 'success' ? 'success' : 'error',
      message: response.data.message || undefined,
    };
  }

  /**
   * Get all stock listings (up to maximum allowed)
   *
   * @returns Promise resolving to all stock listings
   */
  async getAllStockListings(): Promise<ApiResponse<TcbsStockListing[]>> {
    return this.getStockListings({ limit: 5000 });
  }

  /**
   * Get stock listings by exchange
   *
   * @param exchange Exchange code (HOSE, HNX, UPCOM)
   * @param limit Maximum number of results to return
   * @returns Promise resolving to stock listings for the specified exchange
   */
  async getStocksByExchange(
    exchange: TcbsExchange,
    limit: number = 3000
  ): Promise<ApiResponse<TcbsStockListing[]>> {
    return this.getStockListings({ exchange, limit });
  }

  /**
   * Get stock listings by industry
   *
   * @param industryCode Industry code
   * @param limit Maximum number of results to return
   * @returns Promise resolving to stock listings for the specified industry
   */
  async getStocksByIndustry(
    industryCode: string,
    limit: number = 3000
  ): Promise<ApiResponse<TcbsStockListing[]>> {
    return this.getStockListings({ industryCode, limit });
  }

  /**
   * Get stock listings for HOSE exchange
   *
   * @param limit Maximum number of results to return
   * @returns Promise resolving to HOSE stock listings
   */
  async getHoseStocks(
    limit: number = 3000
  ): Promise<ApiResponse<TcbsStockListing[]>> {
    return this.getStocksByExchange(TcbsExchange.HOSE, limit);
  }

  /**
   * Get stock listings for HNX exchange
   *
   * @param limit Maximum number of results to return
   * @returns Promise resolving to HNX stock listings
   */
  async getHnxStocks(
    limit: number = 3000
  ): Promise<ApiResponse<TcbsStockListing[]>> {
    return this.getStocksByExchange(TcbsExchange.HNX, limit);
  }

  /**
   * Get stock listings for UPCOM exchange
   *
   * @param limit Maximum number of results to return
   * @returns Promise resolving to UPCOM stock listings
   */
  async getUpcomStocks(
    limit: number = 3000
  ): Promise<ApiResponse<TcbsStockListing[]>> {
    return this.getStocksByExchange(TcbsExchange.UPCOM, limit);
  }

  /**
   * Get industry list and classification
   *
   * @returns Promise resolving to industry classification data
   */
  async getIndustries(): Promise<ApiResponse<any>> {
    const url = this.buildUrl(TCBS_ENDPOINTS.INDUSTRY);

    const response = await this.request<TcbsResponse<any>>({
      url,
      method: 'GET',
    });

    return {
      data: response.data.data,
      status: response.data.status === 'success' ? 'success' : 'error',
      message: response.data.message || undefined,
    };
  }
}
