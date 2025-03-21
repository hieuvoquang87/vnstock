/**
 * Utility functions for parsing and transforming data
 */

/**
 * Determine the asset type based on the symbol
 * @param symbol - Stock symbol
 * @returns The asset type (stock, index, future, etc.)
 */
export function getAssetType(symbol: string): string {
  if (!symbol) {
    return 'unknown';
  }

  symbol = symbol.toUpperCase();

  if (symbol.includes('INDEX')) {
    return 'index';
  } else if (symbol.includes('VN30F')) {
    return 'future';
  } else if (symbol.endsWith('CW')) {
    return 'covered_warrant';
  } else if (symbol.startsWith('ETF')) {
    return 'etf';
  } else if (symbol.includes('BOND')) {
    return 'bond';
  } else if (symbol.includes('GB')) {
    return 'government_bond';
  } else {
    return 'stock';
  }
}

/**
 * Convert camelCase string to snake_case
 * @param str - The camelCase string to convert
 * @returns The snake_case version of the string
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Safely parse a number from a string, with option to specify decimal places
 * @param value - The value to parse
 * @param decimals - Number of decimal places (optional)
 * @returns The parsed number or NaN if parsing fails
 */
export function parseNumber(value: any, decimals?: number): number {
  if (value === null || value === undefined || value === '') {
    return NaN;
  }

  let parsedValue: number;

  if (typeof value === 'string') {
    // Remove commas used for thousands separators
    const cleanedString = value.replace(/,/g, '');
    parsedValue = Number(cleanedString);
  } else {
    parsedValue = Number(value);
  }

  if (isNaN(parsedValue)) {
    return NaN;
  }

  if (decimals !== undefined) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(parsedValue * multiplier) / multiplier;
  }

  return parsedValue;
}

/**
 * Format price value with appropriate decimal places
 * @param value - The price value to format
 * @param floating - Number of decimal places
 * @returns The formatted price
 */
export function formatPrice(
  value: number | string,
  floating: number = 2
): number {
  const parsedValue = parseNumber(value);

  if (isNaN(parsedValue)) {
    return NaN;
  }

  const multiplier = Math.pow(10, floating);
  return Math.round(parsedValue * multiplier) / multiplier;
}
