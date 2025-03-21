/**
 * Base explorer class for data sources
 */
import { ApiEndpoints, DataSource } from '../../types/config';
import { ApiResponse, RequestOptions } from '../../types/api';
import { config } from '../config';
import { getLogger } from '../utils/logger';
import { sendRequest } from '../utils/client';
import { API_ENDPOINTS, DEFAULT_HEADERS } from '../config/const';

const logger = getLogger('BaseExplorer');

/**
 * Base explorer class that all data source explorers extend
 */
export abstract class BaseExplorer {
  protected source: DataSource;
  protected endpoints: ApiEndpoints;
  protected headers: Record<string, string>;

  /**
   * Constructor
   * @param source - Data source to use
   */
  constructor(source?: DataSource) {
    this.source = source || config.get('defaultSource');
    this.endpoints = API_ENDPOINTS[this.source];
    this.headers = { ...DEFAULT_HEADERS };

    logger.debug(`Initialized BaseExplorer with source: ${this.source}`);
  }

  /**
   * Make an API request to the data source
   * @param options - Request options
   * @returns Promise resolving to API response
   */
  protected async request<T>(
    options: Partial<RequestOptions>
  ): Promise<ApiResponse<T>> {
    // Set default values
    const url = options.url || this.endpoints.baseUrl;
    const method = options.method || 'GET';
    const headers = { ...this.headers, ...(options.headers || {}) };
    const timeout = options.timeout || config.get('apiTimeout');
    const showLog = options.showLog ?? true;

    // Make the request
    try {
      const response = await sendRequest<ApiResponse<T>>({
        url,
        method,
        headers,
        params: options.params,
        payload: options.payload,
        timeout,
        showLog,
      });

      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Request failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Build a full URL from endpoint path
   * @param endpoint - Endpoint path
   * @returns Full URL
   */
  protected buildUrl(endpoint: string): string {
    return `${this.endpoints.baseUrl}${endpoint}`;
  }

  /**
   * Set custom headers for requests
   * @param headers - Custom headers
   */
  public setHeaders(headers: Record<string, string>): void {
    this.headers = { ...this.headers, ...headers };
  }

  /**
   * Get the current data source
   * @returns Current data source
   */
  public getSource(): DataSource {
    return this.source;
  }

  /**
   * Change the data source
   * @param source - New data source
   */
  public setSource(source: DataSource): void {
    this.source = source;
    this.endpoints = API_ENDPOINTS[this.source];
    logger.info(`Changed data source to: ${this.source}`);
  }
}
