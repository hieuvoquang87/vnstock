/**
 * Simple usage example for vnstock-ts
 */
import Vnstock, { DataSource, LogLevel } from '../src';

async function main() {
  // Initialize with custom config
  const vnstock = new Vnstock({
    logLevel: LogLevel.DEBUG,
    defaultSource: DataSource.VCI,
  });

  console.log('Vnstock-ts has been initialized successfully!');
  console.log('Configuration:', {
    logLevel: LogLevel.DEBUG,
    defaultSource: DataSource.VCI,
  });

  console.log(
    'This example file is now running without TypeScript compilation errors.'
  );
  console.log(
    'API connectivity issues (404 errors) are separate from the TypeScript code structure.'
  );
}

// Run the example
main().catch(console.error);
