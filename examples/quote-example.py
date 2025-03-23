#!/usr/bin/env python3
"""
Example script demonstrating the usage of vnstock Quote module.
This script shows how to fetch stock data from different sources (VCI, TCBS, MSN)
and logs all inputs, outputs, and API interactions.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any
import pandas as pd
import sys

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vnstock.explorer.vci.quote import Quote as VCIQuote
from vnstock.explorer.tcbs.quote import Quote as TCBSQuote
from vnstock.explorer.msn.quote import Quote as MSNQuote
from vnstock.explorer.msn.listing import Listing as MSNListing
from examples.utils import setup_logging_dirs, save_logs, prepare_df_for_json

def test_quote_function(quote, function_name: str, source: str, input_data: dict):
    """Test a quote function and save logs.
    
    Args:
        quote: The quote object (VCI, TCBS, or MSN)
        function_name: Name of the function to test
        source: Data source identifier
        input_data: Input parameters for the function
    """
    print(f"Testing {function_name}()...")
    try:
        quote._last_input = input_data
        df = getattr(quote, function_name)(**input_data)
        quote._last_output = prepare_df_for_json(df)
        quote._last_api_logs = getattr(quote, '_api_logs', {})
        save_logs("quote", source, function_name, quote)
    except Exception as e:
        print(f"Error in {function_name}: {str(e)}")
        if hasattr(quote, '_api_logs'):
            print(f"API Logs: {quote._api_logs}")

def test_vci_quote():
    """Test Quote functionality with VCI data source."""
    print("\nTesting VCI Quote...")
    
    # Initialize quote object
    quote = VCIQuote(symbol='VCI')
    
    # Test history
    test_quote_function(quote, 'history', 'vci', {
        "start": "2024-01-01",
        "end": "2024-03-20",
        "interval": "1D",
        "show_log": True
    })
    
    # Test intraday
    test_quote_function(quote, 'intraday', 'vci', {
        "page_size": 1000,
        "show_log": True
    })
    
    # Test price depth
    test_quote_function(quote, 'price_depth', 'vci', {
        "show_log": True
    })

def test_tcbs_quote():
    """Test Quote functionality with TCBS data source."""
    print("\nTesting TCBS Quote...")
    
    # Initialize quote object
    quote = TCBSQuote(symbol='TCB')
    
    # Test history
    test_quote_function(quote, 'history', 'tcbs', {
        "start": "2024-01-01",
        "end": "2024-03-20",
        "interval": "1D",
        "show_log": True
    })
    
    # Test intraday
    test_quote_function(quote, 'intraday', 'tcbs', {
        "page_size": 1000,
        "show_log": True
    })

def test_msn_quote():
    """Test MSN Quote functions"""
    print("\nTesting MSN Quote...")
    
    # First search for the symbol ID
    listing = MSNListing()
    search_results = listing.search_symbol_id(query='MSFT', locale='en-us', show_log=True)
    if len(search_results) > 0:
        symbol_id = search_results.iloc[0]['symbol_id']
        quote = MSNQuote(symbol_id=symbol_id)
        
        # Test history
        test_quote_function(quote, 'history', 'msn', {
            "start": "2024-01-01",
            "end": "2024-03-20",
            "interval": "1D",
            "show_log": True
        })
    else:
        print("Error: Could not find symbol ID for MSFT")

def main():
    """Main function to run all tests"""
    try:
        # Setup logging directories
        setup_logging_dirs('quote')
        
        # Run tests for each data source
        test_vci_quote()
        test_tcbs_quote()
        test_msn_quote()
        
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 