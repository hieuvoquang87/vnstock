# Implementation of Command-Line Interface

**Original Python Implementation**: [cli.py](/vnstock/common/cli.py)


## Overview

The `vnstock` package provides a command-line interface (CLI) that allows users to interact with the library's functionality directly from a terminal. The CLI is built using the `click` library and provides a REPL (Read-Eval-Print Loop) interface for interactive sessions, as well as direct command execution.

## Command Structure

The CLI implements a nested command structure that maps to the organizational structure of the `vnstock` package's functionality:

```
vnstock
└── stock
    └── quote
        └── history
```

### Root Commands

The root level provides the REPL functionality and basic commands.

#### Python Implementation

```python
@click.group(invoke_without_command=True)
@click.pass_context
def cli(ctx):
    """VNStock CLI"""
    ctx.ensure_object(dict)
    if ctx.invoked_subcommand is None:
        click_repl.repl(ctx, prompt_kwargs={'message': '> '})

@cli.command()
def quit():
    """Quit the REPL"""
    raise EOFError()

@cli.command()
def exit():
    """Exit the REPL"""
    raise EOFError()
```

### Stock Commands

The stock group provides access to stock-related functionality.

#### Python Implementation

```python
@cli.group()
@click.pass_context
def stock(ctx):
    """Commands related to stock data"""
    pass
```

### Quote Commands

The quote group provides access to price quote functionality with options to specify the data source.

#### Python Implementation

```python
@stock.group()
@click.option('--source', default='VCI', help='Data source')
@click.pass_context
def quote(ctx, source):
    """Quote commands"""
    ctx.obj['source'] = source
```

### History Command

The history command retrieves historical price data for a specified stock.

#### Python Implementation

```python
@quote.command()
@click.option('--symbol', required=True, help='Stock symbol to retrieve data for.')
@click.option('--start', required=True, help='Start date for historical data')
@click.option('--end', required=True, help='End date for historical data')
@click.option('--interval', default='1D', help='Interval for historical data')
@click.pass_context
def history(ctx, symbol, start, end, interval):
    """Get historical data"""
    source = ctx.obj['source']
    quote = Vnstock(source=source).stock(symbol=symbol).quote
    data = quote.history(start=start, end=end, interval=interval)
    click.echo(data)
```

## TypeScript Implementation

To implement an equivalent CLI in TypeScript, you can use libraries like `commander`, `yargs`, or `oclif`. The following example uses `commander` for its simplicity and similarity to Click's API.

### Installation

```bash
npm install commander inquirer
```

### Command Structure

```typescript
import { Command } from 'commander';
import inquirer from 'inquirer';
import { Vnstock } from '../vnstock';

// Create CLI program
const program = new Command();

// Configure program
program.name('vnstock').description('VNStock CLI').version('1.0.0');

// Define stock command
const stockCommand = program
  .command('stock')
  .description('Commands related to stock data');

// Define quote command
const quoteCommand = stockCommand
  .command('quote')
  .description('Quote commands')
  .option('-s, --source <source>', 'Data source', 'VCI');

// Define history command
quoteCommand
  .command('history')
  .description('Get historical data')
  .requiredOption('--symbol <symbol>', 'Stock symbol to retrieve data for')
  .requiredOption('--start <start>', 'Start date for historical data')
  .requiredOption('--end <end>', 'End date for historical data')
  .option('--interval <interval>', 'Interval for historical data', '1D')
  .action(async (options) => {
    const { symbol, start, end, interval } = options;
    const source = options.parent.source;

    try {
      const quote = new Vnstock({ source }).stock({ symbol }).quote;
      const data = await quote.history({ start, end, interval });
      console.table(data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

// REPL functionality
async function startRepl() {
  console.log('Welcome to VNStock CLI. Type "exit" to quit.');

  let running = true;

  while (running) {
    const { command } = await inquirer.prompt([
      {
        type: 'input',
        name: 'command',
        message: '> ',
      },
    ]);

    if (command.toLowerCase() === 'exit' || command.toLowerCase() === 'quit') {
      running = false;
      continue;
    }

    try {
      // Parse and execute command
      await program.parseAsync(command.split(' '), { from: 'user' });
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  console.log('Goodbye!');
}

// Main entry point
export function cli() {
  // Check if any arguments were provided
  if (process.argv.length > 2) {
    program.parse(process.argv);
  } else {
    startRepl();
  }
}
```

## REPL Functionality

The REPL (Read-Eval-Print Loop) functionality allows users to enter commands interactively, without having to prefix each command with the program name.

### Python Implementation

The Python implementation uses `click_repl` to provide REPL functionality:

```python
if ctx.invoked_subcommand is None:
    click_repl.repl(ctx, prompt_kwargs={'message': '> '})
```

### TypeScript Implementation

The TypeScript implementation uses a custom REPL built with `inquirer`:

```typescript
async function startRepl() {
  console.log('Welcome to VNStock CLI. Type "exit" to quit.');

  let running = true;

  while (running) {
    const { command } = await inquirer.prompt([
      {
        type: 'input',
        name: 'command',
        message: '> ',
      },
    ]);

    if (command.toLowerCase() === 'exit' || command.toLowerCase() === 'quit') {
      running = false;
      continue;
    }

    try {
      // Parse and execute command
      await program.parseAsync(command.split(' '), { from: 'user' });
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  console.log('Goodbye!');
}
```

## Usage Examples

### Direct Command Execution

```bash
# Python
vnstock stock quote history --symbol ACB --start 2024-01-02 --end 2024-07-10 --interval 1D

# TypeScript
vnstock stock quote history --symbol ACB --start 2024-01-02 --end 2024-07-10 --interval 1D
```

### Interactive REPL

```
$ vnstock
> stock quote history --symbol ACB --start 2024-01-02 --end 2024-07-10
                time   open   high   ...   interval   asset_type
0   2024-01-02T00:00:00  23.75  24.00   ...         1D        stock
1   2024-01-03T00:00:00  24.00  24.30   ...         1D        stock
...
> exit
```

## Implementation Details

### Command Context

Both implementations use a context object to pass data between commands. In Python, this is done via Click's context object, while in TypeScript, Commander provides parent command access via `options.parent`.

### Error Handling

The TypeScript implementation adds explicit error handling with try/catch blocks to prevent the REPL from crashing when an error occurs.

### Output Formatting

The Python implementation uses `click.echo()` to output data, while the TypeScript implementation uses `console.table()` for tabular data.

## Additional Commands to Implement

In a full implementation, you should add commands for all the major functionality of the `vnstock` package:

1. **Stock Information**:

   - Company information
   - Financial statements
   - Ownership data

2. **Market Data**:

   - Market indices
   - Top movers
   - Industry performance

3. **Analysis**:
   - Technical indicators
   - Fundamental analysis
   - Screeners

## Dependencies

### Python Dependencies

- `click`: For creating the command-line interface
- `click_repl`: For REPL functionality

### TypeScript Dependencies

- `commander`: For creating the command-line interface
- `inquirer`: For interactive prompts
- Custom `Vnstock` implementation

## Implementation Notes

1. **Command Documentation**: Both implementations provide help text for each command.

2. **Default Values**: Both implementations provide sensible defaults for optional parameters.

3. **Required Options**: Both implementations distinguish between required and optional parameters.

4. **Extensibility**: The command structure is designed to be easily extended with new commands.

5. **TypeScript Specifics**:

   - TypeScript implementation uses async/await for asynchronous operations
   - Error handling is more explicit in the TypeScript implementation
   - Output formatting uses console.table() for better readability

6. **Testing**:

   - CLI implementations should be tested with both direct commands and REPL interactions
   - Mock the underlying Vnstock class for unit testing

7. **Project Structure**:

   - For TypeScript, consider organizing CLI code in a separate directory:
     ```
     src/
     └── cli/
         ├── index.ts  (main CLI entrypoint)
         ├── commands/ (command implementations)
         └── utils/    (CLI-specific utilities)
     ```

8. **Distribution**:
   - For TypeScript, use `pkg` or similar to create platform-specific binaries
   - Make sure to define the CLI entrypoint in package.json:
     ```json
     {
       "bin": {
         "vnstock": "./dist/cli/index.js"
       }
     }
     ```
