def generate_python_code(pipeline):
    nodes = pipeline.nodes
    edges = pipeline.edges
    
    code = [
        "import pandas as pd",
        "import numpy as np",
        "",
        "def run_pipeline():",
        "    results = {}"
    ]
    
    processed = set()
    iterations = 0
    while len(processed) < len(nodes) and iterations < 50:
        iterations += 1
        for node in nodes:
            nid = node['id']
            if nid in processed: continue
            
            inputs = [e for e in edges if e['target'] == nid]
            if all(e['source'] in processed for e in inputs):
                ntype = node['data']['type']
                cfg = node['data']['config']
                
                if ntype == 'source':
                    code.append(f"    # Node: {node['data']['label']}")
                    code.append(f"    results['{nid}'] = pd.read_csv('path_to_file.csv') # Update path")
                elif ntype == 'filter':
                    code.append(f"    df = results['{inputs[0]['source']}'].copy()")
                    col, op, val = cfg.get('column'), cfg.get('operator'), cfg.get('value')
                    if op == 'equals':
                        code.append(f"    results['{nid}'] = df[df['{col}'].astype(str) == '{val}']")
                    elif op == 'gt':
                        code.append(f"    results['{nid}'] = df[pd.to_numeric(df['{col}'], errors='coerce') > {val}]")
                    # ... more logic could be added here
                elif ntype == 'sort':
                    col = cfg.get('column')
                    asc = 'True' if cfg.get('order') == 'asc' else 'False'
                    code.append(f"    results['{nid}'] = results['{inputs[0]['source']}'].sort_values(by='{col}', ascending={asc})")
                
                processed.add(nid)
                
    code.append("    return results")
    code.append("")
    code.append("if __name__ == '__main__':")
    code.append("    res = run_pipeline()")
    code.append("    print('Pipeline Executed Successfully')")
    
    return "\n".join(code)

def generate_sql_code(pipeline):
    return "-- SQL Generation is a work in progress for the DataFlow Studio Engine.\n-- This pipeline describes a complex DAG that is currently mapped to Pandas.\nSELECT * FROM source_data;"
