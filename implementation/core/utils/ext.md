# Extension Utilities

**Original Python Implementation**: [ext.py](/vnstock/core/utils/ext.py)


## Overview

The Extension Utilities module provides extension methods and helper functions that enhance JavaScript's built-in types, adding functionality that's commonly needed throughout the vnstock library. These utilities extend the capabilities of strings, arrays, dates, numbers, and objects to facilitate data manipulation, formatting, and transformation.

## Purpose

The Extension Utilities module serves several key purposes:

1. **Type Enhancement**: Extends JavaScript's built-in types with additional functionality
2. **Code Reusability**: Provides common utility functions to avoid code duplication
3. **Standardization**: Ensures consistent data manipulation across the library
4. **Performance Optimization**: Implements efficient algorithms for common operations
5. **TypeScript Integration**: Leverages TypeScript's declaration merging for proper type definitions

## TypeScript Implementation

### String Extensions

Extensions for the String type:

```typescript
/**
 * Extensions for the String prototype
 */
declare global {
  interface String {
    /** Convert string to title case */
    toTitleCase(): string;
    /** Check if string contains another string (case-insensitive) */
    containsIgnoreCase(search: string): boolean;
    /** Truncate string to a specified length and add ellipsis if needed */
    truncate(maxLength: number, suffix?: string): string;
    /** Convert to slug format (lowercase, hyphens instead of spaces) */
    toSlug(): string;
    /** Parse string as a number, returning the provided default if parsing fails */
    toNumber(defaultValue?: number): number;
  }
}

// Implementation of String extensions
if (!String.prototype.toTitleCase) {
  String.prototype.toTitleCase = function (): string {
    return this.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  };
}

if (!String.prototype.containsIgnoreCase) {
  String.prototype.containsIgnoreCase = function (search: string): boolean {
    return this.toLowerCase().includes(search.toLowerCase());
  };
}

if (!String.prototype.truncate) {
  String.prototype.truncate = function (
    maxLength: number,
    suffix: string = '...'
  ): string {
    if (this.length <= maxLength) return String(this);
    return this.substring(0, maxLength - suffix.length) + suffix;
  };
}

if (!String.prototype.toSlug) {
  String.prototype.toSlug = function (): string {
    return this.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };
}

if (!String.prototype.toNumber) {
  String.prototype.toNumber = function (defaultValue: number = 0): number {
    const parsed = parseFloat(this as string);
    return isNaN(parsed) ? defaultValue : parsed;
  };
}
```

### Array Extensions

Extensions for the Array type:

```typescript
/**
 * Extensions for the Array prototype
 */
declare global {
  interface Array<T> {
    /** Get the first N elements from the array */
    first(n?: number): T | T[] | undefined;
    /** Get the last N elements from the array */
    last(n?: number): T | T[] | undefined;
    /** Group array items by a specified key or function */
    groupBy<K>(keyGetter: ((item: T) => K) | keyof T): Map<K, T[]>;
    /** Remove duplicates from array based on a key or the entire object */
    distinct<K>(keyGetter?: ((item: T) => K) | keyof T): T[];
    /** Find the sum of numeric array elements or property values */
    sum(propertySelector?: ((item: T) => number) | keyof T): number;
    /** Find the average of numeric array elements or property values */
    average(propertySelector?: ((item: T) => number) | keyof T): number;
  }
}

// Implementation of Array extensions
if (!Array.prototype.first) {
  Array.prototype.first = function <T>(n?: number): T | T[] | undefined {
    if (this.length === 0) return undefined;
    if (n === undefined) return this[0];
    return this.slice(0, n);
  };
}

if (!Array.prototype.last) {
  Array.prototype.last = function <T>(n?: number): T | T[] | undefined {
    if (this.length === 0) return undefined;
    if (n === undefined) return this[this.length - 1];
    return this.slice(Math.max(this.length - n, 0));
  };
}

if (!Array.prototype.groupBy) {
  Array.prototype.groupBy = function <T, K>(
    keyGetter: ((item: T) => K) | keyof T
  ): Map<K, T[]> {
    const map = new Map<K, T[]>();

    this.forEach((item: T) => {
      const key =
        typeof keyGetter === 'function'
          ? (keyGetter as (item: T) => K)(item)
          : (item[keyGetter as keyof T] as unknown as K);

      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });

    return map;
  };
}

if (!Array.prototype.distinct) {
  Array.prototype.distinct = function <T, K>(
    keyGetter?: ((item: T) => K) | keyof T
  ): T[] {
    if (!keyGetter) {
      return [...new Set(this)];
    }

    const seen = new Set<K>();
    return this.filter((item: T) => {
      const key =
        typeof keyGetter === 'function'
          ? (keyGetter as (item: T) => K)(item)
          : (item[keyGetter as keyof T] as unknown as K);

      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };
}

if (!Array.prototype.sum) {
  Array.prototype.sum = function <T>(
    propertySelector?: ((item: T) => number) | keyof T
  ): number {
    if (this.length === 0) return 0;

    return this.reduce((total: number, current: T) => {
      let value: number;

      if (!propertySelector) {
        value = typeof current === 'number' ? current : 0;
      } else if (typeof propertySelector === 'function') {
        value = (propertySelector as (item: T) => number)(current);
      } else {
        value = current[propertySelector as keyof T] as unknown as number;
      }

      return total + (typeof value === 'number' ? value : 0);
    }, 0);
  };
}

if (!Array.prototype.average) {
  Array.prototype.average = function <T>(
    propertySelector?: ((item: T) => number) | keyof T
  ): number {
    if (this.length === 0) return 0;
    return this.sum(propertySelector) / this.length;
  };
}
```

### Date Extensions

Extensions for the Date type:

```typescript
/**
 * Extensions for the Date prototype
 */
declare global {
  interface Date {
    /** Format date to YYYY-MM-DD string */
    toYMD(): string;
    /** Format date to DD/MM/YYYY string */
    toDMY(separator?: string): string;
    /** Add days to date */
    addDays(days: number): Date;
    /** Add months to date */
    addMonths(months: number): Date;
    /** Check if date is the same as another date (ignoring time) */
    isSameDay(date: Date): boolean;
    /** Get quarter number (1-4) */
    getQuarter(): number;
  }
}

// Implementation of Date extensions
if (!Date.prototype.toYMD) {
  Date.prototype.toYMD = function (): string {
    const year = this.getFullYear();
    const month = (this.getMonth() + 1).toString().padStart(2, '0');
    const day = this.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
}

if (!Date.prototype.toDMY) {
  Date.prototype.toDMY = function (separator: string = '/'): string {
    const year = this.getFullYear();
    const month = (this.getMonth() + 1).toString().padStart(2, '0');
    const day = this.getDate().toString().padStart(2, '0');
    return `${day}${separator}${month}${separator}${year}`;
  };
}

if (!Date.prototype.addDays) {
  Date.prototype.addDays = function (days: number): Date {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
}

if (!Date.prototype.addMonths) {
  Date.prototype.addMonths = function (months: number): Date {
    const date = new Date(this.valueOf());
    date.setMonth(date.getMonth() + months);
    return date;
  };
}

if (!Date.prototype.isSameDay) {
  Date.prototype.isSameDay = function (date: Date): boolean {
    return (
      this.getFullYear() === date.getFullYear() &&
      this.getMonth() === date.getMonth() &&
      this.getDate() === date.getDate()
    );
  };
}

if (!Date.prototype.getQuarter) {
  Date.prototype.getQuarter = function (): number {
    return Math.floor(this.getMonth() / 3) + 1;
  };
}
```

### Number Extensions

Extensions for the Number type:

```typescript
/**
 * Extensions for the Number prototype
 */
declare global {
  interface Number {
    /** Format number as currency */
    toCurrency(currencyCode?: string, locale?: string): string;
    /** Format number with thousands separators */
    toFormattedString(decimals?: number, locale?: string): string;
    /** Clamp number between min and max values */
    clamp(min: number, max: number): number;
    /** Convert number to percentage string */
    toPercentage(decimals?: number): string;
  }
}

// Implementation of Number extensions
if (!Number.prototype.toCurrency) {
  Number.prototype.toCurrency = function (
    currencyCode: string = 'VND',
    locale: string = 'vi-VN'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(this);
  };
}

if (!Number.prototype.toFormattedString) {
  Number.prototype.toFormattedString = function (
    decimals: number = 0,
    locale: string = 'vi-VN'
  ): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(this);
  };
}

if (!Number.prototype.clamp) {
  Number.prototype.clamp = function (min: number, max: number): number {
    return Math.min(Math.max(this as number, min), max);
  };
}

if (!Number.prototype.toPercentage) {
  Number.prototype.toPercentage = function (decimals: number = 2): string {
    return (this * 100).toFixed(decimals) + '%';
  };
}
```

## Usage Examples

### String Extensions

```typescript
import 'vnstock/core/utils/ext';

// Title case conversion
const title = 'the quick brown fox'.toTitleCase();
console.log(title); // "The Quick Brown Fox"

// Case-insensitive search
const contains = 'Vietnam Stock Market'.containsIgnoreCase('stock');
console.log(contains); // true

// String truncation
const truncated = 'This is a very long string'.truncate(10);
console.log(truncated); // "This is a..."

// Slug conversion
const slug = 'Vietnam Stock Exchange'.toSlug();
console.log(slug); // "vietnam-stock-exchange"
```

### Array Extensions

```typescript
import 'vnstock/core/utils/ext';

// Array grouping
const stocks = [
  { symbol: 'VCB', exchange: 'HOSE', price: 100 },
  { symbol: 'VNM', exchange: 'HOSE', price: 200 },
  { symbol: 'SHB', exchange: 'HNX', price: 50 },
];

// Group by exchange
const byExchange = stocks.groupBy('exchange');
console.log(byExchange.get('HOSE').length); // 2
console.log(byExchange.get('HNX').length); // 1

// Find distinct elements
const distinctByExchange = stocks.distinct('exchange');
console.log(distinctByExchange.length); // 2

// Calculate sum
const totalPrice = stocks.sum('price');
console.log(totalPrice); // 350

// Calculate average
const averagePrice = stocks.average('price');
console.log(averagePrice); // 116.67
```

### Date Extensions

```typescript
import 'vnstock/core/utils/ext';

const date = new Date(2023, 5, 15); // June 15, 2023

// Format as YMD
console.log(date.toYMD()); // "2023-06-15"

// Format as DMY
console.log(date.toDMY()); // "15/06/2023"

// Add days
const nextWeek = date.addDays(7);
console.log(nextWeek.toYMD()); // "2023-06-22"

// Get quarter
console.log(date.getQuarter()); // 2
```

### Number Extensions

```typescript
import 'vnstock/core/utils/ext';

const price = 1234567.89;

// Format as currency
console.log(price.toCurrency()); // "1.234.568 ₫"
console.log(price.toCurrency('USD', 'en-US')); // "$1,234,567.89"

// Format with specified decimals
console.log(price.toFormattedString(2)); // "1.234.567,89"

// Clamp value
console.log((5000).clamp(1000, 3000)); // 3000

// Format as percentage
console.log((0.1234).toPercentage()); // "12.34%"
```

## Integration with TypeScript

For TypeScript projects, the extensions need to be properly typed:

```typescript
// extensions.d.ts
declare global {
  interface String {
    toTitleCase(): string;
    containsIgnoreCase(search: string): boolean;
    truncate(maxLength: number, suffix?: string): string;
    toSlug(): string;
    toNumber(defaultValue?: number): number;
  }

  interface Array<T> {
    first(n?: number): T | T[] | undefined;
    last(n?: number): T | T[] | undefined;
    groupBy<K>(keyGetter: ((item: T) => K) | keyof T): Map<K, T[]>;
    distinct<K>(keyGetter?: ((item: T) => K) | keyof T): T[];
    sum(propertySelector?: ((item: T) => number) | keyof T): number;
    average(propertySelector?: ((item: T) => number) | keyof T): number;
  }

  interface Date {
    toYMD(): string;
    toDMY(separator?: string): string;
    addDays(days: number): Date;
    addMonths(months: number): Date;
    isSameDay(date: Date): boolean;
    getQuarter(): number;
  }

  interface Number {
    toCurrency(currencyCode?: string, locale?: string): string;
    toFormattedString(decimals?: number, locale?: string): string;
    clamp(min: number, max: number): number;
    toPercentage(decimals?: number): string;
  }
}

export {};
```

## Best Practices

When working with extension methods:

1. **Feature Detection**: Always check if the extension already exists before defining it
2. **Global Impact**: Be aware that extensions affect all instances of the extended types
3. **Native Methods**: Don't override built-in methods; create new ones instead
4. **Performance**: Consider the performance impact, especially for frequently used methods
5. **Browser Compatibility**: Test extensions across different browsers and environments

## Implementation Notes

When implementing or extending the Extension Utilities module:

1. **TypeScript Integration**: Ensure proper type definitions for IDE support
2. **Modular Loading**: Allow importing specific extensions to avoid bloating the bundle
3. **Defensive Programming**: Handle edge cases and null/undefined values gracefully
4. **Documentation**: Document each extension with JSDoc comments
5. **Testing**: Write comprehensive tests for each extension method

## References

For related functionality, refer to:

- [Core Utilities Index](./index.md)
- [Transform Utilities](./transform.md)
