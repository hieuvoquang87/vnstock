#!/usr/bin/env python3
"""
Example script demonstrating the usage of vnstock Listing module.
This script shows how to fetch listing data from different sources (VCI, TCBS, MSN)
and logs all inputs, outputs, and API interactions.
"""

import os
import sys

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vnstock.explorer.vci.listing import Listing as VCIListing
from vnstock.explorer.msn.listing import Listing as MSNListing
from examples.utils import setup_logging_dirs, save_logs, prepare_df_for_json

def test_listing_function(listing, function_name: str, source: str, input_data: dict):
    """Test a listing function and save logs.
    
    Args:
        listing: The listing object (VCI or MSN)
        function_name: Name of the function to test
        source: Data source identifier
        input_data: Input parameters for the function
    """
    print(f"Testing {function_name}()...")
    try:
        listing._last_input = input_data
        df = getattr(listing, function_name)(**input_data)
        listing._last_output = prepare_df_for_json(df)
        listing._last_api_logs = getattr(listing, '_api_logs', {})
        save_logs("listing", source, function_name, listing)
    except Exception as e:
        print(f"Error in {function_name}: {str(e)}")
        if hasattr(listing, '_api_logs'):
            print(f"API Logs: {listing._api_logs}")

def test_vci_listing():
    """Test Listing functionality with VCI data source."""
    print("\nTesting VCI Listing...")
    
    # Initialize listing object
    listing = VCIListing()
    
    # Test all_symbols
    test_listing_function(listing, 'all_symbols', 'vci', {})
    
    # Test search_symbols
    test_listing_function(listing, 'search_symbols', 'vci', {
        "query": "VCI"
    })
    
    # Test symbol_details
    test_listing_function(listing, 'symbol_details', 'vci', {
        "symbol": "VCI"
    })

def test_tcbs_listing():
    """Test Listing functionality with TCBS data source."""
    print("\nTesting TCBS Listing...")
    print("Note: TCBS Listing is not supported yet.")
    return

def test_msn_listing():
    """Test Listing functionality with MSN data source."""
    print("\nTesting MSN Listing...")
    
    # Initialize listing object
    listing = MSNListing()
    
    # Test all_symbols
    test_listing_function(listing, 'all_symbols', 'msn', {})
    
    # Test search_symbols
    test_listing_function(listing, 'search_symbols', 'msn', {
        "query": "MSFT",
        "locale": "en-us"
    })
    
    # Test symbol_details
    test_listing_function(listing, 'symbol_details', 'msn', {
        "symbol": "MSFT"
    })

def main():
    """Main function to run all tests"""
    try:
        # Setup logging directories
        setup_logging_dirs('listing')
        
        # Run tests for each data source
        test_vci_listing()
        test_tcbs_listing()
        test_msn_listing()
        
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 