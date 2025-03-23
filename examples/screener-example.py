#!/usr/bin/env python3
"""
Example script demonstrating the usage of vnstock Screener module.
This script shows how to screen stocks using different criteria from different sources (VCI, TCBS, MSN)
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
from vnstock.explorer.tcbs.screener import Screener as TCBSScreener
from examples.utils import setup_logging_dirs, save_logs, prepare_df_for_json

def test_screener_function(screener, function_name: str, source: str, input_data: dict):
    """Test a screener function and save logs.
    
    Args:
        screener: The screener object (VCI, TCBS, or MSN)
        function_name: Name of the function to test
        source: Data source identifier
        input_data: Input parameters for the function
    """
    print(f"Testing {function_name}()...")
    try:
        screener._last_input = input_data
        df = getattr(screener, function_name)(**input_data)
        screener._last_output = prepare_df_for_json(df)
        screener._last_api_logs = getattr(screener, '_api_logs', {})
        save_logs("screener", source, function_name, screener)
    except Exception as e:
        print(f"Error in {function_name}: {str(e)}")
        if hasattr(screener, '_api_logs'):
            print(f"API Logs: {screener._api_logs}")

def test_vci_screener():
    """Test Screener functionality with VCI data source."""
    print("\nTesting VCI Screener...")
    print("Note: VCI Screener is not supported yet.")
    return

def test_tcbs_screener():
    """Test Screener functionality with TCBS data source."""
    print("\nTesting TCBS Screener...")
    
    # Initialize screener object
    screener = TCBSScreener()
    
    # Test stock screener
    test_screener_function(screener, 'stock', 'tcbs', {
        "exchange": "HOSE",
        "industry": "Banks",
        "market_cap": ">1000000000000",  # > 1T VND
        "pe": "<20",
        "pb": "<2",
        "roe": ">15"
    })
    
    # Test technical screener
    test_screener_function(screener, 'technical', 'tcbs', {
        "ma20": ">ma50",
        "rsi": ">30",
        "macd": ">0",
        "volume": ">1000000"
    })
    
    # Test fundamental screener
    test_screener_function(screener, 'fundamental', 'tcbs', {
        "revenueGrowth": ">10",
        "profitGrowth": ">10",
        "roe": ">15",
        "debtRatio": "<50"
    })

def test_msn_screener():
    """Test Screener functionality with MSN data source."""
    print("\nTesting MSN Screener...")
    print("Note: MSN Screener is not supported yet.")
    return

def main():
    """Main function to run all tests"""
    try:
        # Setup logging directories
        setup_logging_dirs('screener')
        
        # Run tests for each data source
        test_vci_screener()
        test_tcbs_screener()
        test_msn_screener()
        
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 