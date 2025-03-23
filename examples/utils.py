#!/usr/bin/env python3
"""
Utility functions for example scripts.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Union
import pandas as pd

class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder for datetime objects."""
    def default(self, obj):
        if isinstance(obj, (pd.Timestamp, datetime)):
            return obj.isoformat()
        return super().default(obj)

def prepare_df_for_json(df: pd.DataFrame) -> dict:
    """Convert DataFrame to JSON-serializable format.
    
    Args:
        df: The DataFrame to convert
        
    Returns:
        A dictionary containing metadata and records, with datetime columns converted to strings
    """
    if not isinstance(df, pd.DataFrame):
        return df
        
    df = df.copy()
    
    # Handle MultiIndex columns
    if isinstance(df.columns, pd.MultiIndex):
        # Flatten hierarchical index
        df = flatten_hierarchical_index(df, separator="_", handle_duplicates=True)
    
    # Convert datetime columns to strings
    for col in df.select_dtypes(include=['datetime64[ns]', 'datetime64[ns, UTC]']).columns:
        df[col] = df[col].dt.strftime('%Y-%m-%d %H:%M:%S')
        
    # Create metadata
    metadata = {
        'shape': list(df.shape),  # Convert tuple to list for JSON serialization
        'columns': list(df.columns),
        'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()}
    }
    
    # Convert DataFrame to records and ensure all values are JSON-serializable
    records = df.to_dict(orient='records')
    for record in records:
        for key, value in record.items():
            if isinstance(value, (pd.Timestamp, datetime)):
                record[key] = value.isoformat()
            elif hasattr(value, 'dtype'):
                record[key] = str(value)
            elif pd.isna(value):
                record[key] = None
    
    return {
        'metadata': metadata,
        'records': records
    }

def setup_logging_dirs(module_name: str):
    """Setup logging directories for a module"""
    # Create base directory for samples
    base_dir = os.path.join('examples', 'samples', module_name)
    
    # Create directories for each data source
    sources = ['vci', 'tcbs', 'msn']
    for source in sources:
        source_dir = os.path.join(base_dir, source)
        if not os.path.exists(source_dir):
            os.makedirs(source_dir)
            
        # Create subdirectories for each function
        if module_name == 'quote':
            functions = ['history', 'intraday', 'price_depth']
        elif module_name == 'company':
            functions = ['overview', 'profile', 'events']
        elif module_name == 'financial':
            functions = ['balance_sheet', 'income_statement', 'cash_flow', 'ratio']
        elif module_name == 'listing':
            functions = ['all_symbols', 'search_symbols', 'symbol_details']
        elif module_name == 'screener':
            functions = ['stock', 'technical', 'fundamental']
        elif module_name == 'trading':
            functions = ['price_board', 'order_book', 'trading_history', 'market_overview']
        else:
            functions = []
            
        for func in functions:
            func_dir = os.path.join(source_dir, func)
            if not os.path.exists(func_dir):
                os.makedirs(func_dir)

def save_logs(function_name: str, input_data: Dict[str, Any], output_data: Union[Dict[str, Any], list], 
            api_logs: Union[Dict[str, Any], None], symbol: str, data_source: str):
    """Save logs for a function call.
    
    Args:
        function_name: Name of the function being tested
        input_data: Input parameters used in the function call
        output_data: Output data from the function call
        api_logs: API logs from the function call
        symbol: Stock symbol
        data_source: Data source (e.g., VCI, TCBS)
    """
    # Create base directory path
    base_dir = os.path.join('examples', 'samples', 'financial', data_source.lower(), function_name)
    
    # Save input parameters
    input_file = os.path.join(base_dir, f'input_{symbol}.json')
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(input_data, f, indent=2, ensure_ascii=False, cls=DateTimeEncoder)
    
    # Save output data
    output_file = os.path.join(base_dir, f'output_{symbol}.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        # Extract records from output data if it's a dictionary with 'records' key
        if isinstance(output_data, dict) and 'records' in output_data:
            json.dump(output_data['records'], f, indent=2, ensure_ascii=False, cls=DateTimeEncoder)
        else:
            json.dump(output_data, f, indent=2, ensure_ascii=False, cls=DateTimeEncoder)
    
    # Save API logs if available
    if api_logs is not None:
        api_file = os.path.join(base_dir, f'api_logs_{symbol}.json')
        with open(api_file, 'w', encoding='utf-8') as f:
            json.dump(api_logs, f, indent=2, ensure_ascii=False, cls=DateTimeEncoder) 