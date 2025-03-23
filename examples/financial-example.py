#!/usr/bin/env python3
"""
Example script demonstrating the usage of vnstock Financial module.
This script shows how to fetch financial data from different sources (VCI, TCBS, MSN)
and logs all inputs, outputs, and API interactions.
"""

import os
import sys

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import logging
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Union
from examples.utils import setup_logging_dirs, save_logs, prepare_df_for_json
from vnstock.explorer.vci.financial import Finance as VCIFinance
from vnstock.explorer.tcbs.financial import Finance as TCBSFinance

def test_financial_function(financial, function_name, **kwargs):
    """Test a financial function and save its logs."""
    try:
        # Save input data
        financial._last_input = kwargs
        
        # Call the function and save output
        function = getattr(financial, function_name)
        output = function(**kwargs)
        
        # Handle tuple output
        if isinstance(output, tuple):
            financial._last_output = {
                'primary_dfs': {k: prepare_df_for_json(v) for k, v in output[0].items()},
                'other_reports': prepare_df_for_json(output[1])
            }
        else:
            # Convert DataFrame to dict, handling MultiIndex columns
            if hasattr(output, 'columns') and isinstance(output.columns, pd.MultiIndex):
                # Convert MultiIndex columns to string with proper formatting
                output.columns = [f"{col[0]} - {col[1]}" if isinstance(col, tuple) and col[0] != 'Meta' else col[1] for col in output.columns]
            financial._last_output = prepare_df_for_json(output)
        
        # Check for API logs
        if hasattr(financial, '_last_api_logs'):
            try:
                save_logs(
                    function_name=function_name,
                    input_data=financial._last_input,
                    output_data=financial._last_output,
                    api_logs=financial._last_api_logs,
                    symbol=financial.symbol,
                    data_source=financial.__class__.__module__.split('.')[-2].upper()
                )
            except Exception as e:
                print(f"Error saving logs for {function_name}: {str(e)}")
                # Continue testing even if log saving fails
                
    except Exception as e:
        # Save error information
        error_info = {
            'error': str(e),
            'error_type': type(e).__name__,
            'traceback': str(e.__traceback__)
        }
        financial._last_output = error_info
        print(f"Error in {function_name}: {str(e)}")
        
        # Save logs even when there's an error
        try:
            save_logs(
                function_name=function_name,
                input_data=financial._last_input,
                output_data=financial._last_output,
                api_logs=getattr(financial, '_last_api_logs', None),
                symbol=financial.symbol,
                data_source=financial.__class__.__module__.split('.')[-2].upper()
            )
        except Exception as log_error:
            print(f"Error saving error logs for {function_name}: {str(log_error)}")
            # Continue testing even if error log saving fails

def test_vci_finance():
    """Test VCI Finance class."""
    print("Testing VCI Finance...")
    vci_finance = VCIFinance(symbol="VCI")
    
    functions_to_test = [
        ("balance_sheet", {"show_log": True}),
        ("income_statement", {"show_log": True}),
        ("cash_flow", {"show_log": True}),
        ("ratio", {"show_log": True, "flatten_columns": True})
    ]
    
    for func_name, kwargs in functions_to_test:
        try:
            print(f"Testing {func_name}()...")
            test_financial_function(vci_finance, func_name, **kwargs)
        except Exception as e:
            print(f"Failed to test {func_name}: {str(e)}")
            # Continue testing other functions even if one fails

def test_tcbs_finance():
    """Test Financial functionality with TCBS data source."""
    print("\nTesting TCBS Finance...")
    
    # Initialize financial object
    financial = TCBSFinance(symbol='TCB')
    
    functions_to_test = [
        ("balance_sheet", {"dropna": True, "get_all": True, "show_log": True}),
        ("income_statement", {"dropna": True, "get_all": True, "show_log": True}),
        ("cash_flow", {"dropna": True, "get_all": True, "show_log": True}),
        ("ratio", {"dropna": True, "get_all": True, "show_log": True})
    ]
    
    for func_name, kwargs in functions_to_test:
        try:
            print(f"Testing {func_name}()...")
            test_financial_function(financial, func_name, **kwargs)
        except Exception as e:
            print(f"Failed to test {func_name}: {str(e)}")
            # Continue testing other functions even if one fails

def test_msn_finance():
    """Test Financial functionality with MSN data source."""
    print("\nTesting MSN Finance...")
    print("Note: MSN Finance is not supported yet.")
    return

def main():
    """Main function to run all tests"""
    try:
        # Setup logging directories
        setup_logging_dirs('financial')
        
        # Run tests for each data source
        test_vci_finance()
        test_tcbs_finance()
        test_msn_finance()
        
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        # Don't exit with error code, just log the error
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 