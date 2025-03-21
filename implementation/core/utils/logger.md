# Logger Utility Implementation

## Overview

The `logger.py` file provides utility functions for configuring and managing logging throughout the vnstock application. It offers a customizable logging system that supports different output destinations, log levels, and formatting options.

## Functions

### `advanced_logger(name, level, handler_type, filename, log_format, date_format, max_bytes, backup_count)`

Configures and returns a customizable logger with various options.

#### Parameters

- `name` (required): string - The logger's name. Example: 'api_logger'.
- `level` (optional): string - Logging level ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'). Default is 'DEBUG'.
- `handler_type` (optional): string - Type of handler ('stream', 'file', 'rotating').
  - 'stream' will print to console
  - 'file' will write to a file
  - 'rotating' will write to a file with a max size and backup files
  - Default is 'stream'.
- `filename` (optional): string - Path to log file. Defaults to current directory if not provided.
- `log_format` (optional): string - Format of the log messages. Default is '%(asctime)s - %(name)s - %(levelname)s - %(message)s'.
- `date_format` (optional): string - Format of the timestamp in log messages. Default is '%Y-%m-%d %H:%M:%S'.
- `max_bytes` (optional): number - Maximum log file size in bytes (for 'rotating' handler). Default is 10485760 (10MB).
- `backup_count` (optional): number - Number of backup files to keep (for 'rotating' handler). Default is 5.

#### Returns

- A configured logger instance with the specified settings.

### `get_logger(name, level, handler_type, filename, log_format, date_format, max_bytes, backup_count)`

A wrapper for `advanced_logger` that maintains backward compatibility while allowing advanced customizations.

#### Parameters

- All parameters are inherited from `advanced_logger`.

#### Returns

- A configured logger instance with the specified settings.

## Implementation Details

### Logger Configuration

The logger implementation handles:

1. Creating named loggers to categorize logs by module or functionality
2. Setting appropriate log levels to control verbosity
3. Configuring handlers to determine where logs are output
4. Formatting log messages with timestamps and context information
5. Managing rotating log files to control disk usage

### Handler Types

Three handler types are supported:

1. **Stream Handler**: Outputs logs to the console (standard output)
2. **File Handler**: Writes logs to a specified file
3. **Rotating File Handler**: Writes logs to a file, creating backup files when size limits are reached

### Log Levels

Standard Python logging levels are supported:

- DEBUG: Detailed information, typically only valuable for diagnosing problems
- INFO: Confirmation that things are working as expected
- WARNING: An indication that something unexpected happened, but the application still works
- ERROR: Due to a more serious problem, the application couldn't perform some function
- CRITICAL: A very serious error, indicating the application may be unable to continue running

## TypeScript Implementation Example

```typescript
/**
 * Logger levels enum
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Handler types for logger
 */
export enum HandlerType {
  STREAM = 'stream',
  FILE = 'file',
  ROTATING = 'rotating',
}

/**
 * Interface for logger configuration
 */
export interface LoggerConfig {
  name: string;
  level?: LogLevel;
  handlerType?: HandlerType;
  filename?: string;
  logFormat?: string;
  dateFormat?: string;
  maxBytes?: number;
  backupCount?: number;
}

/**
 * Logger class for handling logging throughout the application
 */
export class Logger {
  private name: string;
  private level: LogLevel;
  private handlerType: HandlerType;
  private filename?: string;
  private logFormat: string;
  private dateFormat: string;
  private maxBytes: number;
  private backupCount: number;

  /**
   * Creates a new Logger instance
   * @param config Logger configuration
   */
  constructor(config: LoggerConfig) {
    this.name = config.name;
    this.level = config.level || LogLevel.DEBUG;
    this.handlerType = config.handlerType || HandlerType.STREAM;
    this.filename = config.filename;
    this.logFormat =
      config.logFormat ||
      '%(asctime)s - %(name)s - %(levelname)s - %(message)s';
    this.dateFormat = config.dateFormat || 'YYYY-MM-DD HH:mm:ss';
    this.maxBytes = config.maxBytes || 10485760; // 10MB
    this.backupCount = config.backupCount || 5;

    // Initialize the logger based on configuration
    this.initialize();
  }

  /**
   * Initialize the logger based on configuration
   */
  private initialize(): void {
    // Implementation would vary based on the logging library used
    // For browser environments, console API might be wrapped
    // For Node.js, winston or other libraries might be used
  }

  /**
   * Set the logging level
   * @param level New logging level
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
    // Update the underlying logger level
  }

  /**
   * Log a debug message
   * @param message Message to log
   * @param optionalParams Additional parameters to log
   */
  public debug(message: string, ...optionalParams: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[${this.name}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log an info message
   * @param message Message to log
   * @param optionalParams Additional parameters to log
   */
  public info(message: string, ...optionalParams: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[${this.name}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log a warning message
   * @param message Message to log
   * @param optionalParams Additional parameters to log
   */
  public warning(message: string, ...optionalParams: any[]): void {
    if (this.shouldLog(LogLevel.WARNING)) {
      console.warn(`[${this.name}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param optionalParams Additional parameters to log
   */
  public error(message: string, ...optionalParams: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[${this.name}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log a critical message
   * @param message Message to log
   * @param optionalParams Additional parameters to log
   */
  public critical(message: string, ...optionalParams: any[]): void {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      console.error(`[CRITICAL] [${this.name}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Check if a message at the given level should be logged
   * @param messageLevel Level of the message
   * @returns Whether the message should be logged
   */
  private shouldLog(messageLevel: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARNING,
      LogLevel.ERROR,
      LogLevel.CRITICAL,
    ];

    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(messageLevel);

    return messageLevelIndex >= currentLevelIndex;
  }
}

/**
 * Create and return a logger instance
 * @param config Logger configuration
 * @returns Configured logger instance
 */
export function getLogger(config: string | LoggerConfig): Logger {
  // If config is just a string, use it as the name with default settings
  if (typeof config === 'string') {
    return new Logger({ name: config });
  }

  // Otherwise use the provided configuration
  return new Logger(config);
}
```

## Node.js Implementation Considerations

For a Node.js environment, consider using established logging libraries:

1. **Winston**: A multi-transport async logging library

   ```typescript
   import winston from 'winston';

   // Implementation would leverage winston's features
   ```

2. **Pino**: Super fast, all natural JSON logger

   ```typescript
   import pino from 'pino';

   // Implementation would leverage pino's features
   ```

3. **Bunyan**: A JSON logging library for Node.js services

   ```typescript
   import bunyan from 'bunyan';

   // Implementation would leverage bunyan's features
   ```

## Browser Implementation Considerations

For browser environments, consider:

1. Using a wrapper around the console API
2. Implementing remote logging to capture client-side errors
3. Adding timestamps and log levels manually

## Dependencies

- In Python: Built-in logging module, os module
- For TypeScript Node.js: Winston, Pino, or Bunyan (recommended)
- For TypeScript Browser: Custom implementation or lightweight libraries like loglevel

## Usage Example

```typescript
// Get a logger with default settings
const logger = getLogger('api');

// Log messages at different levels
logger.debug('Detailed debug information');
logger.info('Operation completed successfully');
logger.warning('Something unexpected happened');
logger.error('Failed to process request');
logger.critical('System is unstable');

// Change the log level
logger.setLevel(LogLevel.ERROR);
// Now only ERROR and CRITICAL messages will be logged
```

## Notes

1. When implementing in TypeScript, choose a logging library appropriate for your runtime environment (Node.js or browser).
2. Consider adding support for structured logging (JSON format) for better integration with log analysis tools.
3. In production environments, configure appropriate log levels to avoid performance impact and excessive log files.
4. For sensitive applications, ensure logs don't contain personal or sensitive information.
5. Consider implementing log rotation mechanisms for long-running applications to manage disk space.
