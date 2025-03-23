#!/usr/bin/env python3
"""
Example script demonstrating the usage of vnstock Trading module.
This script shows how to fetch trading data from different sources (VCI, TCBS, MSN)
and logs all inputs, outputs, and API interactions.
"""

import os
import sys

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import logging
from datetime import datetime
from typing import Dict, Any, Union
import pandas as pd
from vnstock.explorer.vci.trading import Trading as VCITrading
from vnstock.explorer.tcbs.trading import Trading as TCBSTrading
from examples.utils import setup_logging_dirs, save_logs, prepare_df_for_json

def test_trading_function(trading, function_name: str, source: str, input_data: dict):
    """Test a trading function and save logs.
    
    Args:
        trading: The trading object (VCI, TCBS, or MSN)
        function_name: Name of the function to test
        source: Data source identifier
        input_data: Input parameters for the function
    """
    print(f"Testing {function_name}()...")
    try:
        trading._last_input = input_data
        df = getattr(trading, function_name)(**input_data)
        trading._last_output = prepare_df_for_json(df)
        trading._last_api_logs = getattr(trading, '_api_logs', {})
        save_logs("trading", source, function_name, trading)
    except Exception as e:
        print(f"Error in {function_name}: {str(e)}")
        if hasattr(trading, '_api_logs'):
            print(f"API Logs: {trading._api_logs}")

def test_vci_trading():
    """Test VCI Trading functions"""
    print("\nTesting VCI Trading...")
    trading = VCITrading(symbol='VCI')
    
    # Test price_board
    test_trading_function(trading, 'price_board', 'vci', {
        'symbols_list': ['VCI', 'TCB', 'VCB'],
        'flatten_columns': True
    })

def test_tcbs_trading():
    """Test TCBS Trading functions"""
    print("\nTesting TCBS Trading...")
    trading = TCBSTrading(symbol='TCB')
    
    # Test price_board
    test_trading_function(trading, 'price_board', 'tcbs', {
        'symbol_ls': ['TCB', 'VCI', 'VCB'],
        'std_columns': True
    })

def test_msn_trading():
    """Test MSN Trading functions"""
    print("\nTesting MSN Trading...")
    print("Note: MSN Trading is not supported yet.")

def main():
    """Main function to run all tests"""
    try:
        # Setup logging directories
        setup_logging_dirs('trading')
        
        # Run tests for each data source
        test_vci_trading()
        test_tcbs_trading()
        test_msn_trading()
        
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 