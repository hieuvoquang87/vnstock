# Help Utilities

**Original Python Implementation**: [help.py](/vnstock/core/utils/help.py)


## Overview

The Help Utilities module provides documentation and usage assistance functionality within the vnstock library. It offers programmatic access to documentation, examples, and usage hints, making it easier for users to understand how to use different library components without leaving their development environment.

## Purpose

The Help Utilities module serves several key purposes:

1. **In-Code Documentation**: Provides access to documentation directly from code
2. **Interactive Help**: Offers interactive help for command-line interfaces and REPLs
3. **Example Generation**: Creates runnable code examples for various features
4. **Parameter Documentation**: Documents function parameters and expected formats
5. **API Discovery**: Helps users discover available API endpoints and features

## TypeScript Implementation

### Documentation Access

The core functionality for accessing documentation:

```typescript
/**
 * Documentation entry type
 */
export interface DocumentationEntry {
  title: string;
  description: string;
  examples?: string[];
  parameters?: ParameterDocumentation[];
  returnValue?: string;
  relatedTopics?: string[];
  source?: string;
}

/**
 * Parameter documentation
 */
export interface ParameterDocumentation {
  name: string;
  type: string;
  description: string;
  isOptional: boolean;
  defaultValue?: string;
}

/**
 * Get documentation for a specific topic
 * @param topic The topic to get documentation for
 * @returns Documentation entry for the requested topic
 */
export function getDocumentation(
  topic: string
): DocumentationEntry | undefined {
  // Load documentation from internal registry
  return documentationRegistry[topic];
}

/**
 * List all available documentation topics
 * @param category Optional category to filter by
 * @returns Array of available documentation topics
 */
export function listTopics(category?: string): string[] {
  const topics = Object.keys(documentationRegistry);

  if (!category) {
    return topics;
  }

  return topics.filter(
    (topic) => topic.startsWith(category + '.') || topic === category
  );
}
```

### Example Generation

Functions for generating runnable examples:

````typescript
/**
 * Example code format
 */
export enum ExampleFormat {
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  ASYNC = 'async',
  BROWSER = 'browser',
  NODE = 'node',
}

/**
 * Get example code for a specific function
 * @param functionName The function to get an example for
 * @param format The preferred code format
 * @returns Example code as a string
 */
export function getExample(
  functionName: string,
  format: ExampleFormat = ExampleFormat.TYPESCRIPT
): string | undefined {
  const doc = getDocumentation(functionName);

  if (!doc || !doc.examples || doc.examples.length === 0) {
    return undefined;
  }

  // Find example that matches the requested format, or return the first one
  const example =
    doc.examples.find((ex) => ex.includes(`Format: ${format}`)) ||
    doc.examples[0];

  // Extract the actual code from the example
  const codeMatch = example.match(/```(?:typescript|javascript)([\s\S]*?)```/);
  if (!codeMatch) {
    return example;
  }

  return codeMatch[1].trim();
}

/**
 * Generate a complete runnable example for a function
 * @param functionName The function to generate an example for
 * @param format The preferred code format
 * @returns Complete runnable example
 */
export function generateRunnableExample(
  functionName: string,
  format: ExampleFormat = ExampleFormat.TYPESCRIPT
): string {
  const example = getExample(functionName, format);

  if (!example) {
    return `// No example available for ${functionName}`;
  }

  // Add imports and setup code based on format
  switch (format) {
    case ExampleFormat.TYPESCRIPT:
      return `import { ${functionName} } from 'vnstock';\n\n${example}`;

    case ExampleFormat.JAVASCRIPT:
      return `const { ${functionName} } = require('vnstock');\n\n${example}`;

    case ExampleFormat.ASYNC:
      return `import { ${functionName} } from 'vnstock';\n\n(async () => {\n${example}\n})();`;

    case ExampleFormat.BROWSER:
      return `<script src="https://cdn.jsdelivr.net/npm/vnstock/dist/vnstock.min.js"></script>\n<script>\n${example}\n</script>`;

    case ExampleFormat.NODE:
      return `const { ${functionName} } = require('vnstock');\n\n${example}`;

    default:
      return example;
  }
}
````

### Interactive Help

Utilities for providing interactive help:

````typescript
/**
 * Display help text for a specific function or topic
 * @param topic The function or topic to display help for
 * @returns Formatted help text
 */
export function help(topic?: string): string {
  if (!topic) {
    return generateMainHelp();
  }

  const doc = getDocumentation(topic);

  if (!doc) {
    const suggestions = findSimilarTopics(topic);

    if (suggestions.length > 0) {
      return `No documentation found for "${topic}".\n\nDid you mean:\n${suggestions
        .map((s) => `- ${s}`)
        .join('\n')}`;
    }

    return `No documentation found for "${topic}". Use help() without arguments to see all available topics.`;
  }

  return formatDocumentation(doc);
}

/**
 * Generate main help text with overview of available categories
 * @returns Formatted main help text
 */
function generateMainHelp(): string {
  const categories = [
    {
      name: 'Explorer',
      description: 'Data exploration and retrieval functions',
    },
    { name: 'Analysis', description: 'Technical and fundamental analysis' },
    { name: 'Charts', description: 'Charting and visualization' },
    { name: 'Utils', description: 'Utility functions' },
    { name: 'Config', description: 'Configuration options' },
  ];

  let result = 'vnstock Library Help\n===================\n\n';
  result += 'Available Categories:\n\n';

  categories.forEach((category) => {
    const topics = listTopics(category.name.toLowerCase());
    result += `${category.name} (${topics.length} topics)\n`;
    result += `   ${category.description}\n`;
    result += `   Use help("${category.name.toLowerCase()}") for more information\n\n`;
  });

  result +=
    'For detailed help on a specific function, use help("functionName")';

  return result;
}

/**
 * Find topics similar to the provided topic name
 * @param topic The topic name to find similar topics for
 * @returns Array of similar topic names
 */
function findSimilarTopics(topic: string): string[] {
  const allTopics = listTopics();

  // Simple fuzzy matching based on substring and Levenshtein distance
  return allTopics
    .filter((t) => {
      if (t.includes(topic) || topic.includes(t)) {
        return true;
      }

      const distance = levenshteinDistance(t, topic);
      return distance <= 3; // Allow up to 3 character differences
    })
    .slice(0, 5); // Return at most 5 suggestions
}

/**
 * Calculate Levenshtein distance between two strings
 * @param a First string
 * @param b Second string
 * @returns Levenshtein distance
 */
function levenshteinDistance(a: string, b: string): number {
  // Implementation of Levenshtein distance algorithm
  // (Code omitted for brevity)
  return 0;
}

/**
 * Format documentation entry as readable text
 * @param doc Documentation entry to format
 * @returns Formatted documentation text
 */
function formatDocumentation(doc: DocumentationEntry): string {
  let result = `${doc.title}\n${'='.repeat(doc.title.length)}\n\n`;
  result += `${doc.description}\n\n`;

  if (doc.parameters && doc.parameters.length > 0) {
    result += 'Parameters:\n';
    doc.parameters.forEach((param) => {
      const optionalStr = param.isOptional ? ' (optional)' : '';
      const defaultStr = param.defaultValue
        ? ` (default: ${param.defaultValue})`
        : '';
      result += `  - ${param.name}: ${param.type}${optionalStr}${defaultStr}\n`;
      result += `    ${param.description}\n`;
    });
    result += '\n';
  }

  if (doc.returnValue) {
    result += `Returns: ${doc.returnValue}\n\n`;
  }

  if (doc.examples && doc.examples.length > 0) {
    result += 'Example:\n\n';
    result += doc.examples[0]
      .replace(/```(?:typescript|javascript)([\s\S]*?)```/, '$1')
      .trim();
    result += '\n\n';
  }

  if (doc.relatedTopics && doc.relatedTopics.length > 0) {
    result += 'Related Topics:\n';
    doc.relatedTopics.forEach((topic) => {
      result += `  - ${topic}\n`;
    });
    result += '\n';
  }

  if (doc.source) {
    result += `Source: ${doc.source}\n`;
  }

  return result;
}
````

### API Discovery

Utilities for helping users discover the library's API:

```typescript
/**
 * API category information
 */
export interface APICategory {
  name: string;
  description: string;
  functions: string[];
}

/**
 * Get all API categories
 * @returns Array of API categories
 */
export function getAPICategories(): APICategory[] {
  return [
    {
      name: 'Market Data',
      description: 'Functions for retrieving market data',
      functions: [
        'getStockList',
        'getQuote',
        'getIntraday',
        'getHistoricalData',
      ],
    },
    {
      name: 'Company Information',
      description: 'Functions for retrieving company information',
      functions: [
        'getCompanyProfile',
        'getCompanyNews',
        'getFinancialReport',
        'getOwnership',
      ],
    },
    {
      name: 'Technical Analysis',
      description: 'Functions for technical analysis',
      functions: [
        'calculateSMA',
        'calculateEMA',
        'calculateRSI',
        'calculateMACD',
      ],
    },
    {
      name: 'Fundamental Analysis',
      description: 'Functions for fundamental analysis',
      functions: [
        'getFinancialRatios',
        'getValuation',
        'getCashFlow',
        'getIncomeStatement',
      ],
    },
    {
      name: 'Utilities',
      description: 'Utility functions',
      functions: [
        'exportToExcel',
        'convertToCSV',
        'formatDate',
        'calculateReturn',
      ],
    },
  ];
}

/**
 * Search for API functions matching a keyword
 * @param keyword Keyword to search for
 * @returns Array of matching function names
 */
export function searchAPI(keyword: string): string[] {
  const normalizedKeyword = keyword.toLowerCase();
  const allCategories = getAPICategories();
  const allFunctions: string[] = [];

  // Collect all functions
  allCategories.forEach((category) => {
    allFunctions.push(...category.functions);
  });

  // Filter by keyword
  return allFunctions.filter((func) =>
    func.toLowerCase().includes(normalizedKeyword)
  );
}
```

## Usage Examples

### Basic Documentation Access

```typescript
import { help, getDocumentation } from 'vnstock/core/utils/help';

// Display help for a specific function
console.log(help('getQuote'));

// Get structured documentation for programmatic use
const doc = getDocumentation('getQuote');
if (doc) {
  console.log(`Function: ${doc.title}`);
  console.log(`Description: ${doc.description}`);
  console.log(`Parameters: ${doc.parameters?.length || 0}`);
}
```

### Generating Examples

```typescript
import {
  generateRunnableExample,
  ExampleFormat,
} from 'vnstock/core/utils/help';

// Generate a TypeScript example
const tsExample = generateRunnableExample(
  'getHistoricalData',
  ExampleFormat.TYPESCRIPT
);
console.log(tsExample);

// Generate a browser example
const browserExample = generateRunnableExample(
  'getQuote',
  ExampleFormat.BROWSER
);
console.log(browserExample);
```

### API Discovery

```typescript
import { getAPICategories, searchAPI } from 'vnstock/core/utils/help';

// List all API categories
const categories = getAPICategories();
categories.forEach((category) => {
  console.log(`${category.name}: ${category.description}`);
  console.log(`Available functions: ${category.functions.join(', ')}`);
});

// Search for functions related to "financials"
const financialFunctions = searchAPI('financial');
console.log(`Found ${financialFunctions.length} functions:`);
financialFunctions.forEach((func) => console.log(`- ${func}`));
```

### Interactive Help in CLI

```typescript
import { help } from 'vnstock/core/utils/help';

// Function that could be used in a CLI application
function handleHelpCommand(args: string[]): void {
  if (args.length === 0) {
    console.log(help());
    return;
  }

  console.log(help(args[0]));
}

// Example usage
handleHelpCommand([]); // Show main help
handleHelpCommand(['getQuote']); // Show help for getQuote
```

## Documentation Structure

The documentation in this module is structured as follows:

1. **Main Categories**: The library is divided into logical categories
2. **Function Documentation**: Each function has its own documentation entry
3. **Example Code**: Example code is provided for different environments
4. **Parameter Details**: Each parameter is documented with type and description
5. **Related Topics**: References to related functions and topics are provided

## Implementation Best Practices

When maintaining or extending the Help Utilities module:

1. **Keep Documentation Updated**: Always update documentation when making code changes
2. **Provide Multiple Examples**: Include examples for different use cases and environments
3. **Document Edge Cases**: Include information about error handling and edge cases
4. **Be Consistent**: Maintain a consistent style and format across all documentation
5. **Include Runnable Examples**: Ensure examples can be directly copied and executed

## Dependencies

The Help Utilities module has minimal dependencies:

1. No external dependencies are required
2. Internal documentation registry stored within the module

## Implementation Notes

When implementing or extending the Help Utilities module:

1. **Lightweight Design**: Keep the module lightweight to minimize bundle size
2. **Lazy Loading**: Consider lazy-loading documentation to improve performance
3. **Multilingual Support**: Design with potential internationalization in mind
4. **Versioning**: Include version information in documentation entries
5. **Testing**: Test documentation examples to ensure they work as expected

## References

For related functionality, refer to:

- [Core Utilities Index](./index.md)
- [User Agent Utilities](./user_agent.md)
