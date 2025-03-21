# Implementation of Logger Utility

## Overview

The `logger` module provides a consistent logging mechanism for the `vnstock` package. It offers customizable logging configuration, supporting different output destinations, formatting options, and log rotation capabilities. This module serves as the foundation for all logging throughout the package, ensuring consistent log formatting and behavior.

## Functions

### Advanced Logger

A configurable logger setup function that offers extensive customization options.

#### Python Implementation

```python
def advanced_logger(name,
                    level='DEBUG',
                    handler_type='stream',
                    filename=None,
                    log_format=None,
                    date_format=None,
                    max_bytes=10485760,
                    backup_count=5):
    """
    Configure and return a customizable logger with various options.

    Parameters:
    - name: str - the logger's name. Example: 'api_logger'.
    - level: str - logging level ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'). Example: 'INFO'.
    - handler_type: str - type of handler ('stream', 'file', 'rotating').
      'stream' will print to console, 'file' will write to a file, 'rotating' will write to a file with a max size and backup files. Example: 'rotating'.
    - filename: str - path to log file. Defaults to current directory if None provided. Example: '/var/logs/api.log'.
    - log_format: str - format of the log messages. Example: '%(asctime)s - %(levelname)s - %(message)s'.
    - date_format: str - format of the timestamp in log messages. Example: '%Y-%m-%d %H:%M:%S'.
    - max_bytes: int - maximum log file size in bytes (for 'rotating' handler). Example: 10485760 (10MB).
    - backup_count: int - number of backup files to keep (for 'rotating' handler). Example: 5.

    Returns:
    - logger: logging.Logger instance.
    """
    logger = logging.getLogger(name)
    if logger.hasHandlers():  # Prevent adding multiple handlers if already configured
        logger.handlers.clear()

    # Set default file name if none provided
    if filename is None:
        filename = os.path.join(os.getcwd(), f'{name}.log')

    # Set default log format if not provided
    log_format = log_format or '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    date_format = date_format or '%Y-%m-%d %H:%M:%S'

    # Create formatter
    formatter = logging.Formatter(log_format, date_format)

    # Determine the handler type
    if handler_type == 'file':
        handler = logging.FileHandler(filename)
    elif handler_type == 'rotating':
        handler = RotatingFileHandler(filename, maxBytes=max_bytes, backupCount=backup_count)
    else:  # Default to stream handler
        handler = logging.StreamHandler()

    # Set formatter and add handler to logger
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Set the logging level
    logger.setLevel(getattr(logging, level.upper()))

    return logger
```

### Logger Getter

A simplified wrapper function for getting a logger with customizable options.

#### Python Implementation

```python
def get_logger(name,
               level='DEBUG',
               handler_type='stream',
               filename=None,
               log_format=None,
               date_format=None,
               max_bytes=10485760,
               backup_count=5):
    """
    Wrapper for advanced_logger that allows custom logging configurations.
    Provides backward compatibility while allowing advanced customizations.

    Parameters:
    - All parameters are inherited from advanced_logger.

    Returns:
    - logger: logging.Logger instance.
    """
    return advanced_logger(name=name,
                           level=level,
                           handler_type=handler_type,
                           filename=filename,
                           log_format=log_format,
                           date_format=date_format,
                           max_bytes=max_bytes,
                           backup_count=backup_count)
```

## TypeScript Implementation

The equivalent functionality in TypeScript can be implemented using a custom logger class:

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

/**
 * Log levels with their numeric values
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4,
}

/**
 * Type of logger handler
 */
export type HandlerType = 'stream' | 'file' | 'rotating';

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /** Name of the logger */
  name: string;
  /** Logging level */
  level?: LogLevel | string;
  /** Type of log handler */
  handlerType?: HandlerType;
  /** Path to log file (for file-based handlers) */
  filename?: string;
  /** Format of log messages */
  logFormat?: string;
  /** Format of the date in log messages */
  dateFormat?: string;
  /** Maximum file size in bytes (for rotating handler) */
  maxBytes?: number;
  /** Number of backup files to keep (for rotating handler) */
  backupCount?: number;
}

/**
 * Custom logger implementation for consistent logging across the application
 */
export class Logger {
  private static instances: Map<string, Logger> = new Map();
  private name: string;
  private level: LogLevel;
  private handlerType: HandlerType;
  private filename: string | null;
  private logFormat: string;
  private dateFormat: string;
  private maxBytes: number;
  private backupCount: number;
  private fileStream: fs.WriteStream | null = null;

  /**
   * Get a logger instance with the given name and options
   *
   * @param nameOrOptions - Logger name or configuration options
   * @param options - Additional configuration options
   * @returns Logger instance
   */
  public static getLogger(
    nameOrOptions: string | LoggerOptions,
    options: Partial<LoggerOptions> = {}
  ): Logger {
    // Handle string name or options object
    const name =
      typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name;

    // Combine options
    const fullOptions =
      typeof nameOrOptions === 'string'
        ? { name, ...options }
        : { ...nameOrOptions, ...options };

    // Return existing logger if it exists
    if (Logger.instances.has(name)) {
      return Logger.instances.get(name)!;
    }

    // Create a new logger
    const logger = new Logger(fullOptions);
    Logger.instances.set(name, logger);
    return logger;
  }

  /**
   * Create a new Logger instance with the specified options
   *
   * @param options - Logger configuration options
   */
  private constructor(options: LoggerOptions) {
    this.name = options.name;
    this.level = this.parseLogLevel(options.level || 'DEBUG');
    this.handlerType = options.handlerType || 'stream';
    this.filename = options.filename || null;
    this.logFormat =
      options.logFormat || '[{datetime}] [{name}] [{level}]: {message}';
    this.dateFormat = options.dateFormat || 'yyyy-MM-dd HH:mm:ss';
    this.maxBytes = options.maxBytes || 10485760; // 10MB default
    this.backupCount = options.backupCount || 5;

    // Initialize file handler if needed
    if (this.handlerType !== 'stream' && this.filename) {
      this.initializeFileHandler();
    }
  }

  /**
   * Initialize file handling for file or rotating handler types
   */
  private initializeFileHandler(): void {
    if (!this.filename) {
      this.filename = path.join(process.cwd(), `${this.name}.log`);
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(this.filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // For rotating handler, check file size and rotate if needed
    if (this.handlerType === 'rotating' && fs.existsSync(this.filename)) {
      const stats = fs.statSync(this.filename);
      if (stats.size >= this.maxBytes) {
        this.rotateLogFiles();
      }
    }

    // Open the file stream
    this.fileStream = fs.createWriteStream(this.filename, { flags: 'a' });
  }

  /**
   * Rotate log files for the rotating handler
   */
  private rotateLogFiles(): void {
    if (!this.filename) return;

    // Remove the oldest log file if it exists
    const oldestLog = `${this.filename}.${this.backupCount}`;
    if (fs.existsSync(oldestLog)) {
      fs.unlinkSync(oldestLog);
    }

    // Shift other log files
    for (let i = this.backupCount - 1; i >= 1; i--) {
      const oldFile = `${this.filename}.${i}`;
      const newFile = `${this.filename}.${i + 1}`;
      if (fs.existsSync(oldFile)) {
        fs.renameSync(oldFile, newFile);
      }
    }

    // Rename the current log file
    fs.renameSync(this.filename, `${this.filename}.1`);
  }

  /**
   * Parse log level from string or enum
   *
   * @param level - Log level as string or enum
   * @returns LogLevel enum value
   */
  private parseLogLevel(level: string | LogLevel): LogLevel {
    if (typeof level === 'number') {
      return level;
    }

    const upperLevel = level.toUpperCase();
    switch (upperLevel) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARNING':
        return LogLevel.WARNING;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'CRITICAL':
        return LogLevel.CRITICAL;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Get the string representation of a log level
   *
   * @param level - LogLevel enum value
   * @returns String representation of the log level
   */
  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARNING:
        return 'WARNING';
      case LogLevel.ERROR:
        return 'ERROR';
      case LogLevel.CRITICAL:
        return 'CRITICAL';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Format a log message according to the configured format
   *
   * @param level - LogLevel of the message
   * @param message - Log message content
   * @returns Formatted log message
   */
  private formatLogMessage(level: LogLevel, message: string): string {
    const levelName = this.getLevelName(level);
    const datetime = format(new Date(), this.dateFormat);

    return this.logFormat
      .replace('{datetime}', datetime)
      .replace('{name}', this.name)
      .replace('{level}', levelName)
      .replace('{message}', message);
  }

  /**
   * Log a message if its level is at or above the configured level
   *
   * @param level - LogLevel of the message
   * @param message - Log message content
   */
  private log(level: LogLevel, message: string): void {
    // Only log if the message level is at or above the configured level
    if (level < this.level) {
      return;
    }

    const formattedMessage = this.formatLogMessage(level, message);

    if (this.handlerType === 'stream') {
      // Log to console
      if (level >= LogLevel.ERROR) {
        console.error(formattedMessage);
      } else if (level >= LogLevel.WARNING) {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    } else if (this.fileStream) {
      // Log to file
      this.fileStream.write(`${formattedMessage}\n`);

      // Check file size for rotating handler
      if (this.handlerType === 'rotating' && this.filename) {
        const stats = fs.statSync(this.filename);
        if (stats.size >= this.maxBytes) {
          // Close current stream
          this.fileStream.end();
          // Rotate logs and open a new stream
          this.rotateLogFiles();
          this.fileStream = fs.createWriteStream(this.filename, { flags: 'a' });
        }
      }
    }
  }

  /**
   * Log a debug message
   *
   * @param message - Log message
   */
  public debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  /**
   * Log an info message
   *
   * @param message - Log message
   */
  public info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Log a warning message
   *
   * @param message - Log message
   */
  public warning(message: string): void {
    this.log(LogLevel.WARNING, message);
  }

  /**
   * Log an error message
   *
   * @param message - Log message
   */
  public error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  /**
   * Log a critical message
   *
   * @param message - Log message
   */
  public critical(message: string): void {
    this.log(LogLevel.CRITICAL, message);
  }

  /**
   * Set the log level
   *
   * @param level - New log level
   */
  public setLevel(level: LogLevel | string): void {
    this.level = this.parseLogLevel(level);
  }

  /**
   * Clean up resources when the logger is no longer needed
   */
  public close(): void {
    if (this.fileStream) {
      this.fileStream.end();
      this.fileStream = null;
    }
  }
}

/**
 * Simplified export for getting a logger with default settings
 *
 * @param name - Logger name
 * @param level - Log level
 * @returns Logger instance
 */
export function getLogger(
  name: string,
  level: LogLevel | string = LogLevel.DEBUG
): Logger {
  return Logger.getLogger({ name, level });
}

/**
 * Configure global logging settings
 *
 * @param level - Default log level for all loggers
 */
export function configureLogger(level: LogLevel | string): void {
  // Update all existing loggers
  Logger['instances'].forEach((logger) => {
    logger.setLevel(level);
  });
}
```

## Usage Examples

### Python Examples

#### Basic Usage

```python
from vnstock.core.utils.logger import get_logger

# Create a console logger with default settings
logger = get_logger("my_module")
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical message")
```

#### File Logger

```python
from vnstock.core.utils.logger import get_logger

# Create a file logger
logger = get_logger(
    name="file_logger",
    level="INFO",
    handler_type="file",
    filename="/path/to/logs/app.log"
)

logger.info("This message will be written to the log file")
```

#### Rotating File Logger

```python
from vnstock.core.utils.logger import get_logger

# Create a rotating file logger with custom settings
logger = get_logger(
    name="api_logger",
    level="DEBUG",
    handler_type="rotating",
    filename="/path/to/logs/api.log",
    max_bytes=5 * 1024 * 1024,  # 5MB
    backup_count=3
)

logger.debug("This message will be written to the rotating log file")
```

### TypeScript Examples

#### Basic Usage

```typescript
import { getLogger } from './logger';

// Create a console logger with default settings
const logger = getLogger('my-module');
logger.debug('Debug message');
logger.info('Info message');
logger.warning('Warning message');
logger.error('Error message');
logger.critical('Critical message');
```

#### File Logger

```typescript
import { Logger, LogLevel } from './logger';

// Create a file logger
const logger = Logger.getLogger({
  name: 'file-logger',
  level: LogLevel.INFO,
  handlerType: 'file',
  filename: '/path/to/logs/app.log',
});

logger.info('This message will be written to the log file');
```

#### Rotating File Logger

```typescript
import { Logger } from './logger';

// Create a rotating file logger with custom settings
const logger = Logger.getLogger({
  name: 'api-logger',
  level: 'DEBUG',
  handlerType: 'rotating',
  filename: '/path/to/logs/api.log',
  maxBytes: 5 * 1024 * 1024, // 5MB
  backupCount: 3,
});

logger.debug('This message will be written to the rotating log file');
```

#### Changing Log Level at Runtime

```typescript
import { Logger, LogLevel, configureLogger } from './logger';

// Create a logger
const logger = Logger.getLogger('app');

// Log at initial level
logger.debug('This might not be visible if level is higher than DEBUG');

// Change log level for this specific logger
logger.setLevel(LogLevel.DEBUG);
logger.debug('Now this debug message should be visible');

// Change log level for all loggers
configureLogger(LogLevel.INFO);
logger.debug("This won't be visible again");
logger.info('But this info message will be visible');
```

## Implementation Details

### Logger Hierarchy

Both implementations support the logger name hierarchy concept, where loggers are organized in a tree structure based on their names:

- `app` would be a parent logger
- `app.api` would be a child logger of `app`
- `app.api.auth` would be a child logger of `app.api`

The TypeScript implementation maintains this structure by storing logger instances in a static map.

### Log Rotation

The log rotation functionality allows the logger to:

1. Create a new log file when the current file exceeds a specified size
2. Maintain a specified number of backup files
3. Delete the oldest logs when the maximum number of backups is reached

This is crucial for long-running applications to prevent log files from growing too large.

### Handler Types

Both implementations support three types of handlers:

1. **Stream Handler**: Outputs logs to the console (standard output/error)
2. **File Handler**: Writes logs to a specified file
3. **Rotating File Handler**: Writes logs to a file with size-based rotation

### Log Levels

The standard log levels are supported in both implementations, from lowest to highest severity:

1. **DEBUG**: Detailed information for debugging
2. **INFO**: General operational information
3. **WARNING**: Potential issues or unexpected behavior
4. **ERROR**: Errors that prevented an operation from completing
5. **CRITICAL**: Critical errors that may cause the application to terminate

## Dependencies

### Python Dependencies

- `logging`: Standard Python logging module
- `logging.handlers.RotatingFileHandler`: For rotating file handler
- `os`: For file path operations

### TypeScript Dependencies

- `fs`: For file system operations
- `path`: For file path operations
- `date-fns`: For date formatting

## Implementation Notes

1. **Singleton Pattern**: Both implementations ensure that only one logger instance exists for each name, following the singleton pattern.

2. **Clear Interface**: Both implementations provide a simple, clear interface for obtaining and using loggers.

3. **Configuration Flexibility**: Both implementations allow customizing various aspects of logging behavior, from log levels to formatting.

4. **Handler Management**: The Python implementation clears existing handlers before adding new ones to prevent duplicate logging. The TypeScript implementation maintains a similar approach.

5. **Performance Considerations**:

   - Both implementations check the log level before formatting the message to avoid unnecessary string operations
   - The TypeScript implementation opens file streams once and reuses them for better performance

6. **Resource Management**: The TypeScript implementation includes a `close()` method to clean up resources, particularly important for file streams.

7. **TypeScript Enhancements**:
   - Strong typing with enums and interfaces
   - More explicit error handling for file operations
   - Runtime log level changes for all loggers via `configureLogger()`
