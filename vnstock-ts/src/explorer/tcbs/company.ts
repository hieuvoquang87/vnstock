/**
 * TCBS Explorer Company Profile Implementation
 */
import { ApiResponse } from '../../types/api';
import { BaseExplorer } from '../base';
import { TcbsResponse, TcbsCompanyProfile, TcbsOwnershipData } from './models';
import { TCBS_ENDPOINTS } from './const';
import { DataSource } from '../../types/config';

/**
 * TCBS Explorer class for company profile data
 */
export class TcbsExplorer extends BaseExplorer {
  /**
   * Constructor
   */
  constructor() {
    super(DataSource.TCBS);
    // Set any specific headers required for TCBS
    this.setHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  /**
   * Get company profile information
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to company profile
   */
  async getCompanyProfile(
    symbol: string
  ): Promise<ApiResponse<TcbsCompanyProfile>> {
    this.validateSymbol(symbol);

    const url = this.buildUrl(`${TCBS_ENDPOINTS.COMPANY_PROFILE}/${symbol}`);

    const response = await this.request<TcbsResponse<TcbsCompanyProfile>>({
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
   * Get ownership structure information
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to ownership data
   */
  async getOwnershipStructure(
    symbol: string
  ): Promise<ApiResponse<TcbsOwnershipData>> {
    this.validateSymbol(symbol);

    const url = this.buildUrl(`${TCBS_ENDPOINTS.OWNERSHIP}/${symbol}`);

    const response = await this.request<TcbsResponse<TcbsOwnershipData>>({
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
   * Get major shareholders information
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to major shareholders data
   */
  async getMajorShareholders(symbol: string): Promise<ApiResponse<any>> {
    const response = await this.getOwnershipStructure(symbol);

    if (response.status === 'success' && response.data) {
      return {
        data: response.data.majorShareholders,
        status: 'success',
        message: undefined,
      };
    }

    return {
      data: [],
      status: 'error',
      message: response.message || 'Failed to retrieve major shareholders',
    };
  }

  /**
   * Get company executive information
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to company executives data
   */
  async getCompanyExecutives(symbol: string): Promise<ApiResponse<any>> {
    this.validateSymbol(symbol);

    const url = this.buildUrl(`${TCBS_ENDPOINTS.EXECUTIVES}/${symbol}`);

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

  /**
   * Get company subsidiaries
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to company subsidiaries data
   */
  async getCompanySubsidiaries(symbol: string): Promise<ApiResponse<any>> {
    this.validateSymbol(symbol);

    const url = this.buildUrl(`${TCBS_ENDPOINTS.SUBSIDIARIES}/${symbol}`);

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

  /**
   * Get company business model
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to business model data
   */
  async getBusinessModel(symbol: string): Promise<ApiResponse<any>> {
    this.validateSymbol(symbol);

    const url = this.buildUrl(`${TCBS_ENDPOINTS.BUSINESS_MODEL}/${symbol}`);

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

  /**
   * Get company dividend history
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to dividend history data
   */
  async getDividendHistory(symbol: string): Promise<ApiResponse<any>> {
    this.validateSymbol(symbol);

    const url = this.buildUrl(`${TCBS_ENDPOINTS.DIVIDEND_HISTORY}/${symbol}`);

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

  /**
   * Validate stock symbol format
   *
   * @param symbol Stock symbol to validate
   * @throws Error if symbol is invalid
   */
  private validateSymbol(symbol: string): void {
    if (!symbol || typeof symbol !== 'string' || symbol.length < 3) {
      throw new Error(`Invalid stock symbol: ${symbol}`);
    }
  }
}
