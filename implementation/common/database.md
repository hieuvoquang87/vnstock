# Implementation of Database Utilities

**Original Python Implementation**: [database.py](/vnstock/common/database.py)


## Overview

The Database module provides utilities for persistent storage and retrieval of financial data in the `vnstock` package. While the current implementation primarily focuses on API-based data retrieval, database utilities allow for local caching, offline analysis, and persistent storage of historical data.

## Purpose

The Database utilities serve several key purposes:

1. Local caching of frequently accessed financial data to reduce API calls
2. Persistent storage of historical data for offline analysis
3. Efficient querying and filtering of large datasets
4. Supporting data synchronization between remote APIs and local storage

## Python Implementation

In the Python implementation, database utilities focus on providing a consistent interface for database operations while supporting multiple database backends.

```python
import sqlite3
import pandas as pd
import os
from typing import Optional, Union, Dict, List, Any, Tuple
from pathlib import Path
import json
from datetime import datetime
import logging
from vnstock.core.utils.logger import get_logger

logger = get_logger(__name__)

class DatabaseManager:
    """
    Class to manage database connections and operations.
    Supports SQLite by default, with extensibility for other database engines.
    """

    def __init__(self, db_path: Optional[str] = None, engine: str = 'sqlite', show_log: bool = False):
        """
        Initialize the DatabaseManager.

        Args:
            db_path: Path to the database file or connection string
            engine: Database engine to use (currently supports 'sqlite')
            show_log: Whether to show detailed logs
        """
        self.engine = engine.lower()
        self.show_log = show_log

        # If no path provided, use default location
        if db_path is None:
            home_dir = str(Path.home())
            data_dir = os.path.join(home_dir, '.vnstock', 'data')
            os.makedirs(data_dir, exist_ok=True)
            db_path = os.path.join(data_dir, 'vnstock.db')

        self.db_path = db_path
        self.conn = None

        if not show_log:
            logger.setLevel(logging.ERROR)

        if self.engine == 'sqlite':
            self._connect_sqlite()
        else:
            raise ValueError(f"Database engine '{engine}' not supported")

    def _connect_sqlite(self):
        """Establish a connection to SQLite database."""
        try:
            self.conn = sqlite3.connect(self.db_path)
            if self.show_log:
                logger.info(f"Connected to SQLite database at {self.db_path}")
        except sqlite3.Error as e:
            logger.error(f"SQLite connection error: {e}")
            raise

    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            if self.show_log:
                logger.info("Database connection closed")

    def execute_query(self, query: str, params: Tuple = None) -> Optional[List[Tuple]]:
        """
        Execute a SQL query with optional parameters.

        Args:
            query: SQL query to execute
            params: Parameters for the query

        Returns:
            Query results as a list of tuples, or None for non-SELECT queries
        """
        if not self.conn:
            self._connect_sqlite()

        cursor = self.conn.cursor()

        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)

            if query.strip().upper().startswith("SELECT"):
                result = cursor.fetchall()
                return result
            else:
                self.conn.commit()
                return None
        except sqlite3.Error as e:
            logger.error(f"Query execution error: {e}")
            logger.error(f"Query: {query}")
            if params:
                logger.error(f"Parameters: {params}")
            self.conn.rollback()
            raise
        finally:
            cursor.close()

    def dataframe_to_sql(self, df: pd.DataFrame, table_name: str, if_exists: str = 'replace',
                         index: bool = False) -> bool:
        """
        Save a DataFrame to a SQL table.

        Args:
            df: DataFrame to save
            table_name: Name of the target table
            if_exists: How to behave if the table exists ('fail', 'replace', or 'append')
            index: Whether to include the DataFrame's index as a column

        Returns:
            True if successful, False otherwise
        """
        if df.empty:
            logger.warning(f"Empty DataFrame not saved to table {table_name}")
            return False

        try:
            df.to_sql(table_name, self.conn, if_exists=if_exists, index=index)
            if self.show_log:
                logger.info(f"Saved DataFrame to table {table_name} ({len(df)} rows)")
            return True
        except Exception as e:
            logger.error(f"Error saving DataFrame to table {table_name}: {e}")
            return False

    def query_to_dataframe(self, query: str, params: Tuple = None) -> pd.DataFrame:
        """
        Execute a SQL query and return the results as a DataFrame.

        Args:
            query: SQL query to execute
            params: Parameters for the query

        Returns:
            DataFrame containing query results
        """
        try:
            if not self.conn:
                self._connect_sqlite()

            if params:
                df = pd.read_sql_query(query, self.conn, params=params)
            else:
                df = pd.read_sql_query(query, self.conn)

            if self.show_log:
                logger.info(f"Query returned {len(df)} rows")
            return df
        except Exception as e:
            logger.error(f"Error executing query to DataFrame: {e}")
            logger.error(f"Query: {query}")
            if params:
                logger.error(f"Parameters: {params}")
            return pd.DataFrame()

    def create_table(self, table_name: str, columns: Dict[str, str]) -> bool:
        """
        Create a new table in the database.

        Args:
            table_name: Name of the table to create
            columns: Dictionary mapping column names to their SQL types

        Returns:
            True if successful, False otherwise
        """
        if not columns:
            logger.error("No columns specified for table creation")
            return False

        # Construct the CREATE TABLE statement
        column_defs = [f"{name} {dtype}" for name, dtype in columns.items()]
        query = f"CREATE TABLE IF NOT EXISTS {table_name} ({', '.join(column_defs)})"

        try:
            self.execute_query(query)
            if self.show_log:
                logger.info(f"Created table {table_name}")
            return True
        except Exception as e:
            logger.error(f"Error creating table {table_name}: {e}")
            return False

    def table_exists(self, table_name: str) -> bool:
        """
        Check if a table exists in the database.

        Args:
            table_name: Name of the table to check

        Returns:
            True if the table exists, False otherwise
        """
        query = "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
        result = self.execute_query(query, (table_name,))
        return len(result) > 0 if result else False

    def get_table_columns(self, table_name: str) -> List[str]:
        """
        Get the column names for a table.

        Args:
            table_name: Name of the table

        Returns:
            List of column names
        """
        if not self.table_exists(table_name):
            return []

        query = f"PRAGMA table_info({table_name})"
        result = self.execute_query(query)
        return [row[1] for row in result] if result else []
```

## TypeScript Implementation

The TypeScript implementation provides similar functionality with appropriate adaptations for Node.js or browser environments.

```typescript
import { Database, verbose } from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getLogger } from '../core/utils/logger';

const logger = getLogger('database');

/**
 * Options for creating a DatabaseManager instance
 */
export interface DatabaseOptions {
  dbPath?: string;
  engine?: 'sqlite' | 'mysql' | 'postgres';
  showLog?: boolean;
}

/**
 * Class to manage database connections and operations
 */
export class DatabaseManager {
  private engine: string;
  private dbPath: string;
  private conn: Database | null = null;
  private showLog: boolean;

  /**
   * Create a DatabaseManager instance
   *
   * @param options - Configuration options
   */
  constructor(options: DatabaseOptions = {}) {
    const { dbPath = null, engine = 'sqlite', showLog = false } = options;

    this.engine = engine.toLowerCase();
    this.showLog = showLog;

    // If no path provided, use default location
    if (!dbPath) {
      const homeDir = os.homedir();
      const dataDir = path.join(homeDir, '.vnstock', 'data');

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.dbPath = path.join(dataDir, 'vnstock.db');
    } else {
      this.dbPath = dbPath;
    }

    if (!showLog) {
      logger.setLevel('error');
    }

    if (this.engine === 'sqlite') {
      this.connectSqlite();
    } else {
      throw new Error(`Database engine '${engine}' not supported`);
    }
  }

  /**
   * Establish a connection to SQLite database
   */
  private connectSqlite(): void {
    try {
      verbose(); // Enable verbose mode for better error messages
      this.conn = new Database(this.dbPath);

      if (this.showLog) {
        logger.info(`Connected to SQLite database at ${this.dbPath}`);
      }
    } catch (error) {
      logger.error(`SQLite connection error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  public close(): void {
    if (this.conn) {
      this.conn.close();
      this.conn = null;

      if (this.showLog) {
        logger.info('Database connection closed');
      }
    }
  }

  /**
   * Execute a SQL query with optional parameters
   *
   * @param query - SQL query to execute
   * @param params - Parameters for the query
   * @returns Query results or null for non-SELECT queries
   */
  public executeQuery(query: string, params: any[] = []): any[] | null {
    if (!this.conn) {
      this.connectSqlite();
    }

    try {
      const isSelect = query.trim().toUpperCase().startsWith('SELECT');

      if (isSelect) {
        const stmt = this.conn!.prepare(query);
        return stmt.all(params);
      } else {
        const stmt = this.conn!.prepare(query);
        stmt.run(params);
        return null;
      }
    } catch (error) {
      logger.error(`Query execution error: ${error.message}`);
      logger.error(`Query: ${query}`);
      if (params.length > 0) {
        logger.error(`Parameters: ${JSON.stringify(params)}`);
      }
      throw error;
    }
  }

  /**
   * Save data to a SQL table
   *
   * @param data - Array of objects to save
   * @param tableName - Name of the target table
   * @param ifExists - How to behave if the table exists
   * @returns True if successful, false otherwise
   */
  public saveToTable(
    data: any[],
    tableName: string,
    ifExists: 'fail' | 'replace' | 'append' = 'replace'
  ): boolean {
    if (!data || data.length === 0) {
      logger.warning(`Empty data not saved to table ${tableName}`);
      return false;
    }

    try {
      if (!this.conn) {
        this.connectSqlite();
      }

      const tableExists = this.tableExists(tableName);

      // Handle table existence based on ifExists parameter
      if (tableExists) {
        if (ifExists === 'fail') {
          throw new Error(`Table ${tableName} already exists`);
        } else if (ifExists === 'replace') {
          this.executeQuery(`DROP TABLE IF EXISTS ${tableName}`);
        }
      }

      // Create table if it doesn't exist or was dropped
      if (!tableExists || ifExists === 'replace') {
        const sampleRow = data[0];
        const columns: Record<string, string> = {};

        // Determine column types based on sample row
        Object.keys(sampleRow).forEach((key) => {
          const value = sampleRow[key];
          let type: string;

          if (typeof value === 'number') {
            type = Number.isInteger(value) ? 'INTEGER' : 'REAL';
          } else if (typeof value === 'string') {
            // Check if string is a date
            type = !isNaN(Date.parse(value)) ? 'TEXT' : 'TEXT';
          } else if (typeof value === 'boolean') {
            type = 'INTEGER';
          } else if (value === null || value === undefined) {
            type = 'TEXT'; // Default for null values
          } else {
            type = 'TEXT'; // Default for objects, arrays, etc.
          }

          columns[key] = type;
        });

        this.createTable(tableName, columns);
      }

      // Insert data
      this.conn!.transaction(() => {
        const columns = Object.keys(data[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const columnStr = columns.join(', ');

        const insertStmt = this.conn!.prepare(
          `INSERT INTO ${tableName} (${columnStr}) VALUES (${placeholders})`
        );

        for (const row of data) {
          const values = columns.map((col) => row[col]);
          insertStmt.run(values);
        }
      })();

      if (this.showLog) {
        logger.info(`Saved ${data.length} rows to table ${tableName}`);
      }

      return true;
    } catch (error) {
      logger.error(`Error saving data to table ${tableName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Query data and return as an array of objects
   *
   * @param query - SQL query to execute
   * @param params - Parameters for the query
   * @returns Array of objects representing query results
   */
  public queryToArray(query: string, params: any[] = []): any[] {
    try {
      if (!this.conn) {
        this.connectSqlite();
      }

      const results = this.executeQuery(query, params);

      if (this.showLog && results) {
        logger.info(`Query returned ${results.length} rows`);
      }

      return results || [];
    } catch (error) {
      logger.error(`Error executing query to array: ${error.message}`);
      logger.error(`Query: ${query}`);

      if (params.length > 0) {
        logger.error(`Parameters: ${JSON.stringify(params)}`);
      }

      return [];
    }
  }

  /**
   * Create a new table in the database
   *
   * @param tableName - Name of the table to create
   * @param columns - Object mapping column names to their SQL types
   * @returns True if successful, false otherwise
   */
  public createTable(
    tableName: string,
    columns: Record<string, string>
  ): boolean {
    if (!columns || Object.keys(columns).length === 0) {
      logger.error('No columns specified for table creation');
      return false;
    }

    // Construct the CREATE TABLE statement
    const columnDefs = Object.entries(columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');

    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;

    try {
      this.executeQuery(query);

      if (this.showLog) {
        logger.info(`Created table ${tableName}`);
      }

      return true;
    } catch (error) {
      logger.error(`Error creating table ${tableName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a table exists in the database
   *
   * @param tableName - Name of the table to check
   * @returns True if the table exists, false otherwise
   */
  public tableExists(tableName: string): boolean {
    const query =
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?";
    const result = this.executeQuery(query, [tableName]);
    return result ? result.length > 0 : false;
  }

  /**
   * Get the column names for a table
   *
   * @param tableName - Name of the table
   * @returns Array of column names
   */
  public getTableColumns(tableName: string): string[] {
    if (!this.tableExists(tableName)) {
      return [];
    }

    const query = `PRAGMA table_info(${tableName})`;
    const result = this.executeQuery(query);
    return result ? result.map((row: any) => row.name) : [];
  }
}
```

## Usage Examples

### Python Examples

#### Basic Database Operations

```python
from vnstock.common.database import DatabaseManager

# Create a database manager
db = DatabaseManager(show_log=True)

# Create a table for stocks
db.create_table(
    "stocks",
    {
        "symbol": "TEXT PRIMARY KEY",
        "company_name": "TEXT",
        "exchange": "TEXT",
        "industry": "TEXT"
    }
)

# Import stock listing data
from vnstock import Explorer
explorer = Explorer(source="TCBS")
listings = explorer.listing.all()

# Save to database
db.dataframe_to_sql(listings, "stock_listings")

# Query data
vn30_stocks = db.query_to_dataframe(
    "SELECT * FROM stock_listings WHERE exchange = ?",
    ("HOSE",)
)
print(f"Found {len(vn30_stocks)} HOSE stocks")

# Close the connection
db.close()
```

#### Caching Historical Data

```python
from vnstock.common.database import DatabaseManager
from vnstock import Explorer
import pandas as pd
from datetime import datetime, timedelta

# Create a database manager
db = DatabaseManager()

# Function to get historical data with caching
def get_cached_history(symbol, start_date, end_date):
    # Check if we have this data in the database
    query = """
    SELECT * FROM stock_history
    WHERE symbol = ? AND date >= ? AND date <= ?
    ORDER BY date
    """
    cached_data = db.query_to_dataframe(query, (symbol, start_date, end_date))

    if not cached_data.empty:
        print(f"Using cached data for {symbol}")
        return cached_data

    # If not in cache, fetch from API
    print(f"Fetching fresh data for {symbol}")
    explorer = Explorer(source="TCBS")
    history = explorer.trading.history(
        symbol=symbol,
        start_date=start_date,
        end_date=end_date
    )

    # Save to cache
    if not history.empty:
        db.dataframe_to_sql(
            history,
            "stock_history",
            if_exists='append'
        )

    return history

# Example usage
start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
end = datetime.now().strftime("%Y-%m-%d")

# First call will fetch from API
vnm_history = get_cached_history("VNM", start, end)

# Second call will use cached data
vnm_history_again = get_cached_history("VNM", start, end)

db.close()
```

### TypeScript Examples

#### Basic Database Operations

```typescript
import { DatabaseManager } from 'vnstock-ts';

async function manageStockData() {
  // Create a database manager
  const db = new DatabaseManager({ showLog: true });

  // Create a table for stocks
  db.createTable('stocks', {
    symbol: 'TEXT PRIMARY KEY',
    company_name: 'TEXT',
    exchange: 'TEXT',
    industry: 'TEXT',
  });

  // Import stock listing data
  import { Explorer } from 'vnstock-ts';

  const explorer = new Explorer({ source: 'TCBS' });
  const listings = await explorer.listing.all();

  // Save to database
  db.saveToTable(listings, 'stock_listings');

  // Query data
  const hoseStocks = db.queryToArray(
    'SELECT * FROM stock_listings WHERE exchange = ?',
    ['HOSE']
  );

  console.log(`Found ${hoseStocks.length} HOSE stocks`);

  // Close the connection
  db.close();
}

manageStockData();
```

#### Caching Historical Data

```typescript
import { DatabaseManager } from 'vnstock-ts';
import { Explorer } from 'vnstock-ts';

// Create a database manager
const db = new DatabaseManager();

/**
 * Get historical data with caching
 */
async function getCachedHistory(
  symbol: string,
  startDate: string,
  endDate: string
) {
  // Check if we have this data in the database
  const query = `
    SELECT * FROM stock_history 
    WHERE symbol = ? AND date >= ? AND date <= ?
    ORDER BY date
  `;

  const cachedData = db.queryToArray(query, [symbol, startDate, endDate]);

  if (cachedData.length > 0) {
    console.log(`Using cached data for ${symbol}`);
    return cachedData;
  }

  // If not in cache, fetch from API
  console.log(`Fetching fresh data for ${symbol}`);
  const explorer = new Explorer({ source: 'TCBS' });
  const history = await explorer.trading.history({
    symbol,
    startDate,
    endDate,
  });

  // Save to cache
  if (history.length > 0) {
    db.saveToTable(history, 'stock_history', 'append');
  }

  return history;
}

// Example usage
async function getStockHistory() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  // First call will fetch from API
  const vnmHistory = await getCachedHistory('VNM', startDate, endDate);

  // Second call will use cached data
  const vnmHistoryAgain = await getCachedHistory('VNM', startDate, endDate);

  db.close();
}

getStockHistory();
```

## Implementation Details

### Database Engines

1. **SQLite**: The default database engine, ideal for local caching and single-user applications. Requires no server setup and works well for most use cases.

2. **MySQL/PostgreSQL** (extensible): For larger datasets or multi-user scenarios, the implementation can be extended to support these engines.

### Data Storage Strategy

1. **Historical Data**: Store OHLCV data with appropriate indexes on symbol and date columns for efficient querying.

2. **Metadata**: Store stock information, listings, and other reference data that doesn't change frequently.

3. **Cache Invalidation**: Implement strategies to refresh cached data based on age or explicit invalidation.

### Browser Environment

For browser environments, the implementation can use:

1. **IndexedDB**: For modern browsers with better storage capabilities.

2. **LocalStorage**: For smaller datasets with simpler requirements.

```typescript
// Browser-specific implementation example
export class BrowserDatabaseManager {
  private dbName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'vnstock') {
    this.dbName = dbName;
  }

  // Implementation methods for IndexedDB...
}
```

### Dependencies

#### Python Dependencies

- `sqlite3`: Standard library module for SQLite database access
- `pandas`: For data manipulation and DataFrame operations
- Core `vnstock` utilities for logging and data transformation

#### TypeScript Dependencies

- `better-sqlite3`: For SQLite database access in Node.js
- Core `vnstock-ts` utilities for logging

## Implementation Notes

1. **Connection Management**: The implementation handles database connections automatically, creating them when needed and closing them explicitly.

2. **Error Handling**: Comprehensive error handling ensures that database operations fail gracefully with informative error messages.

3. **Performance Considerations**: For large datasets, consider implementing indexing strategies and query optimization.

4. **Data Serialization**: Special handling for date/time values and numeric types ensures proper serialization and deserialization.

5. **Migration Support**: Consider adding schema migration utilities for version upgrades.

6. **Transaction Support**: Implement transaction support for operations that modify multiple tables or require atomicity.

7. **Security**: Follow best practices for database security, including parameterized queries to prevent SQL injection attacks.
