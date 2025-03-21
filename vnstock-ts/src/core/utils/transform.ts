import { formatPrice } from './parser';

/**
 * Interface for stock data point
 */
export interface OHLCDataPoint {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  source: string;
  asset_type: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Interface for intraday data point
 */
export interface IntradayDataPoint {
  time: string;
  price: number;
  volume: number;
  side: string;
  position: string;
  symbol: string;
  source: string;
  asset_type: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Convert OHLC (Open, High, Low, Close) data from API to a standardized format
 */
export function ohlcToDataframe(
  data: any,
  columnMap: Record<string, string>,
  dtypeMap: Record<string, string>,
  assetType: string,
  symbol: string,
  source: string,
  interval: string,
  floating: number = 2,
  resampleMap?: Record<string, string>
): OHLCDataPoint[] {
  if (!data || !Array.isArray(data.data)) {
    return [];
  }

  // Transform each data point
  return data.data.map((item: any) => {
    const dataPoint: OHLCDataPoint = {
      time: '', // Default values that will be overwritten
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      volume: 0,
      symbol,
      source,
      asset_type: assetType,
    };

    // Map each field from the item to the dataPoint using the columnMap
    for (const [key, value] of Object.entries(columnMap)) {
      const originalValue = item[key];

      // Process based on dtype
      if (dtypeMap[value] === 'float') {
        dataPoint[value] = formatPrice(originalValue, floating);
      } else if (dtypeMap[value] === 'int') {
        dataPoint[value] = parseInt(originalValue, 10);
      } else if (dtypeMap[value] === 'str') {
        dataPoint[value] = String(originalValue);
      } else if (dtypeMap[value] === 'datetime') {
        // Convert timestamp to ISO string if it's a number
        if (typeof originalValue === 'number') {
          dataPoint[value] = new Date(originalValue * 1000).toISOString();
        } else {
          dataPoint[value] = originalValue;
        }
      } else {
        dataPoint[value] = originalValue;
      }
    }

    return dataPoint;
  });
}

/**
 * Convert intraday data from API to a standardized format
 */
export function intradayToDataframe(
  data: any,
  columnMap: Record<string, string>,
  dtypeMap: Record<string, string>,
  symbol: string,
  assetType: string,
  source: string
): IntradayDataPoint[] {
  if (!data || !Array.isArray(data.data)) {
    return [];
  }

  // Transform each data point
  return data.data.map((item: any) => {
    const dataPoint: IntradayDataPoint = {
      time: '', // Default values that will be overwritten
      price: 0,
      volume: 0,
      side: '',
      position: '',
      symbol,
      source,
      asset_type: assetType,
    };

    // Map each field from the item to the dataPoint using the columnMap
    for (const [key, value] of Object.entries(columnMap)) {
      const originalValue = item[key];

      // Process based on dtype
      if (dtypeMap[value] === 'float') {
        dataPoint[value] = formatPrice(originalValue);
      } else if (dtypeMap[value] === 'int') {
        dataPoint[value] = parseInt(originalValue, 10);
      } else if (dtypeMap[value] === 'str') {
        dataPoint[value] = String(originalValue);
      } else if (dtypeMap[value] === 'datetime') {
        // Convert timestamp to ISO string if it's a number
        if (typeof originalValue === 'number') {
          dataPoint[value] = new Date(originalValue * 1000).toISOString();
        } else {
          dataPoint[value] = originalValue;
        }
      } else {
        dataPoint[value] = originalValue;
      }
    }

    return dataPoint;
  });
}
