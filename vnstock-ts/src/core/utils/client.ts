/**
 * HTTP client utilities for making requests
 */
import axios from 'axios';
import { getLogger } from './logger';

const logger = getLogger('core.utils.client');

/**
 * Request options for sending HTTP requests
 */
interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payload?: any;
  params?: Record<string, any>;
  timeout?: number;
  showLog?: boolean;
}

/**
 * Send an HTTP request with the specified options
 * @param options - Request options
 * @returns Promise with response data
 */
export async function sendRequest<T>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    headers = {},
    payload,
    params,
    timeout = 30000,
    showLog = false,
  } = options;

  if (showLog) {
    logger.info(`Sending ${method} request to ${url}`);
    if (payload) {
      logger.debug(`Request payload: ${JSON.stringify(payload)}`);
    }
  }

  try {
    const response = await axios({
      method,
      url,
      headers,
      data: payload,
      params,
      timeout,
    });

    if (showLog) {
      logger.info(
        `Received response from ${url} with status ${response.status}`
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        `Request failed: ${error.message} (${
          error.response?.status || 'unknown status'
        })`
      );
      if (error.response) {
        logger.debug(`Response data: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      logger.error(`Request failed with error: ${error}`);
    }
    throw error;
  }
}
