import pandas as pd
import numpy as np
import os
from django.conf import settings

def apply_transform(df, node, input_data_map={}):
    if df is None: return None
    
    node_type = node.get('data', {}).get('type')
    config = node.get('data', {}).get('config', {})
    result = df.copy()
    
    try:
        if node_type == 'filter':
            col = config.get('column')
            op = config.get('operator')
            val = config.get('value')
            
            if col and op and val and col in result.columns:
                if op == 'equals': result = result[result[col].astype(str) == str(val)]
                elif op == 'contains': result = result[result[col].astype(str).str.contains(str(val), case=False, na=False)]
                elif op == 'gt': result = result[pd.to_numeric(result[col], errors='coerce') > float(val)]
                elif op == 'lt': result = result[pd.to_numeric(result[col], errors='coerce') < float(val)]
        
        elif node_type == 'sort':
            col = config.get('column')
            order = config.get('order', 'asc') == 'asc'
            if col and col in result.columns:
                result = result.sort_values(by=col, ascending=order)
        
        elif node_type == 'group_by':
            group_col = config.get('groupByColumn')
            agg_col = config.get('aggregateColumn')
            op = config.get('operation', 'sum')
            
            if group_col and agg_col and group_col in result.columns and agg_col in result.columns:
                agg_name = f"{op}_{agg_col}"
                result = result.groupby(group_col)[agg_col].agg(op).reset_index(name=agg_name)

        elif node_type == 'rename':
            old_name = config.get('oldName')
            new_name = config.get('newName')
            if old_name and new_name and old_name in result.columns:
                result = result.rename(columns={old_name: new_name})
        
        elif node_type == 'formula':
            new_col = config.get('newColumn')
            expr = config.get('expression')
            if new_col and expr:
                # Use pandas eval for simple expressions
                # Note: In a production app, use a safer eval method
                result[new_col] = result.eval(expr)

        elif node_type == 'remove_duplicates':
            cols = config.get('columns', [])
            if cols:
                # Ensure columns exist
                cols = [c for c in cols if c in result.columns]
                if cols: result = result.drop_duplicates(subset=cols)
            else:
                result = result.drop_duplicates()

        elif node_type == 'missing_handler':
            strategy = config.get('strategy', 'drop')
            col = config.get('column')
            if col and col in result.columns:
                if strategy == 'drop': result = result.dropna(subset=[col])
                elif strategy == 'fill_zero': result[col] = result[col].fillna(0)
                elif strategy == 'fill_mean': result[col] = result[col].fillna(result[col].mean())
            else:
                if strategy == 'drop': result = result.dropna()

        elif node_type == 'join':
            secondary_id = config.get('secondaryInputId')
            left_key = config.get('leftKey')
            right_key = config.get('rightKey')
            join_type = config.get('joinType', 'inner')
            secondary_df = input_data_map.get(secondary_id)
            
            if left_key and right_key and secondary_df is not None and left_key in result.columns and right_key in secondary_df.columns:
                result = pd.merge(result, secondary_df, left_on=left_key, right_on=right_key, how=join_type)

        elif node_type == 'profiler':
            # Profiler adds stats to the result object in a special field
            # In Python we can return it as an attribute or separate metadata
            stats = {}
            if len(result) > 0:
                for col in result.columns:
                    series = result[col]
                    stats[col] = {
                        'count': int(series.count()),
                        'unique': int(series.nunique()),
                        'nulls': int(series.isnull().sum()),
                        'type': str(series.dtype)
                    }
                    if pd.api.types.is_numeric_dtype(series):
                        stats[col].update({
                            'min': float(series.min()),
                            'max': float(series.max()),
                            'avg': float(series.mean())
                        })
            result._stats = stats

    except Exception as e:
        print(f"Transform error in node {node.get('id')}: {e}")
        
    return result

def load_file_data(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    try:
        if ext == '.csv':
            # 1. Try common delimiters explicitly first (Faster and more reliable for large files)
            for sep in [',', ';', '\t', '|']:
                for enc in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        df = pd.read_csv(file_path, sep=sep, encoding=enc, low_memory=False)
                        # If it only has 1 column and it's not a single-column file, it might be the wrong separator
                        if df.shape[1] > 1:
                            return df
                        # Fallback: keep the single column DF if we have no better options later
                        last_resort_df = df
                    except:
                        continue
            
            # 2. Fallback to sniffer (engine='python')
            for enc in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    return pd.read_csv(file_path, sep=None, engine='python', encoding=enc)
                except:
                    continue
            
            # 3. If we found a single-column DF, return it
            if 'last_resort_df' in locals():
                return last_resort_df
                
            raise Exception("Could not decode CSV with common encodings or delimiters.")
        elif ext in ['.xlsx', '.xls']:
            return pd.read_excel(file_path)
        elif ext == '.json':
            try:
                return pd.read_json(file_path)
            except:
                # Fallback to records orient for standard JSON arrays
                try:
                    return pd.read_json(file_path, orient='records')
                except:
                    # Last ditch effort: read as dict and wrap in list
                    import json
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                        if isinstance(data, dict):
                            return pd.DataFrame([data])
                        return pd.DataFrame(data)
    except Exception as e:
        print(f"Engine Data Loading Error for {file_path}: {str(e)}")
    return None
