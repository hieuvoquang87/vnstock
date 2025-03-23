#!/usr/bin/env python3
"""
Example script demonstrating the usage of vnstock Company module.
This script shows how to fetch company data from different sources (VCI, TCBS, MSN)
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
from vnstock.explorer.vci.company import Company as VCICompany
from vnstock.explorer.tcbs.company import Company as TCBSCompany
from examples.utils import setup_logging_dirs, save_logs, prepare_df_for_json

def test_company_function(company, function_name: str, source: str, input_data: dict):
    """Test a company function and save logs.
    
    Args:
        company: The company object (VCI, TCBS, or MSN)
        function_name: Name of the function to test
        source: Data source identifier
        input_data: Input parameters for the function
    """
    print(f"Testing {function_name}()...")
    try:
        company._last_input = input_data
        df = getattr(company, function_name)(**input_data)
        company._last_output = prepare_df_for_json(df)
        company._last_api_logs = getattr(company, '_api_logs', {})
        save_logs("company", source, function_name, company)
    except Exception as e:
        print(f"Error in {function_name}: {str(e)}")
        if hasattr(company, '_api_logs'):
            print(f"API Logs: {company._api_logs}")

def test_vci_company():
    """Test Company functionality with VCI data source."""
    print("\nTesting VCI Company...")
    
    # Initialize company object
    company = VCICompany(symbol='VCI')
    
    # Test overview
    test_company_function(company, 'overview', 'vci', {})
    
    # Test events
    test_company_function(company, 'events', 'vci', {})

def test_tcbs_company():
    """Test Company functionality with TCBS data source."""
    print("\nTesting TCBS Company...")
    
    # Initialize company object
    company = TCBSCompany(symbol='TCB')
    
    # Test overview
    test_company_function(company, 'overview', 'tcbs', {})
    
    # Test events
    test_company_function(company, 'events', 'tcbs', {
        'page_size': 15,
        'page': 0
    })

def test_msn_company():
    """Test Company functionality with MSN data source."""
    print("\nTesting MSN Company...")
    print("Note: MSN Company is not supported yet.")
    return

def main():
    """Main function to run all tests"""
    try:
        # Setup logging directories
        setup_logging_dirs('company')
        
        # Run tests for each data source
        test_vci_company()
        test_tcbs_company()
        test_msn_company()
        
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 