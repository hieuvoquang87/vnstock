/**
 * Logging utilities for vnstock-ts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4,
  NONE = 5,
}

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  error(message: string): void;
  critical(message: string): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

class ConsoleLogger implements Logger {
  private level: LogLevel;
  private name: string;

  constructor(name: string, level: LogLevel = LogLevel.INFO) {
    this.name = name;
    this.level = level;
  }

  private log(level: LogLevel, levelName: string, message: string): void {
    if (level >= this.level) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${levelName}] [${this.name}] ${message}`;

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage);
          break;
        case LogLevel.INFO:
          console.info(logMessage);
          break;
        case LogLevel.WARNING:
          console.warn(logMessage);
          break;
        case LogLevel.ERROR:
          console.error(logMessage);
          break;
        case LogLevel.CRITICAL:
          console.error(logMessage);
          break;
      }
    }
  }

  debug(message: string): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message);
  }

  info(message: string): void {
    this.log(LogLevel.INFO, 'INFO', message);
  }

  warning(message: string): void {
    this.log(LogLevel.WARNING, 'WARNING', message);
  }

  error(message: string): void {
    this.log(LogLevel.ERROR, 'ERROR', message);
  }

  critical(message: string): void {
    this.log(LogLevel.CRITICAL, 'CRITICAL', message);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }
}

// Cache for loggers
const loggers: Record<string, Logger> = {};

/**
 * Get a logger instance for a specific module
 * @param name - Name of the module
 * @param level - Log level (default: LogLevel.INFO)
 * @returns Logger instance
 */
export function getLogger(
  name: string,
  level: LogLevel = LogLevel.INFO
): Logger {
  if (!loggers[name]) {
    loggers[name] = new ConsoleLogger(name, level);
  }
  return loggers[name];
}

/**
 * Configure global log level for all loggers
 * @param level - The log level to set
 */
export function configureLogLevel(level: LogLevel): void {
  Object.values(loggers).forEach((logger) => {
    logger.setLevel(level);
  });
}
