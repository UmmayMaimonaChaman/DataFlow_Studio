"""
DataFlow Studio — Code Generation Engine
Converts a pipeline DAG into executable SQL or Python (Pandas) code.
Author: Ummay Maimona Chaman
"""


def _topo_sort(nodes, edges):
    """Return nodes in topological order."""
    processed = set()
    ordered = []
    iterations = 0
    while len(processed) < len(nodes) and iterations < 50:
        iterations += 1
        for node in nodes:
            nid = node['id']
            if nid in processed:
                continue
            inputs = [e for e in edges if e['target'] == nid]
            if all(e['source'] in processed for e in inputs):
                ordered.append(node)
                processed.add(nid)
    return ordered


# ---------------------------------------------------------------------------
# Python / Pandas Code Generator
# ---------------------------------------------------------------------------

def generate_python_code(pipeline):
    nodes = pipeline.nodes
    edges = pipeline.edges
    ordered = _topo_sort(nodes, edges)

    lines = [
        "# ============================================================",
        "# DataFlow Studio — Auto-generated Pipeline Script",
        f"# Pipeline: {pipeline.name}",
        "# Author  : Ummay Maimona Chaman",
        "# ============================================================",
        "",
        "import pandas as pd",
        "import numpy as np",
        "",
        "",
        "def run_pipeline():",
        "    results = {}",
        "",
    ]

    for node in ordered:
        nid = node['id']
        data = node.get('data', {})
        ntype = data.get('type')
        cfg = data.get('config') or {}
        label = data.get('label', ntype)
        inputs = [e for e in edges if e['target'] == nid]
        src_id = inputs[0]['source'] if inputs else None

        lines.append(f"    # ── {label} ({ntype}) ──────────────────────────")

        if ntype == 'source':
            fname = cfg.get('fileName', 'your_file.csv')
            lines.append(f"    results['{nid}'] = pd.read_csv('{fname}', low_memory=False)")

        elif ntype == 'filter' and src_id:
            col = cfg.get('column', 'column')
            op = cfg.get('operator', 'equals')
            val = cfg.get('value', '')
            lines.append(f"    _df = results['{src_id}'].copy()")
            if op == 'equals':
                lines.append(f"    results['{nid}'] = _df[_df['{col}'].astype(str) == '{val}']")
            elif op == 'contains':
                lines.append(f"    results['{nid}'] = _df[_df['{col}'].astype(str).str.contains('{val}', case=False, na=False)]")
            elif op == 'gt':
                lines.append(f"    results['{nid}'] = _df[pd.to_numeric(_df['{col}'], errors='coerce') > {val}]")
            elif op == 'lt':
                lines.append(f"    results['{nid}'] = _df[pd.to_numeric(_df['{col}'], errors='coerce') < {val}]")
            else:
                lines.append(f"    results['{nid}'] = _df  # operator '{op}' not yet supported")

        elif ntype == 'sort' and src_id:
            col = cfg.get('column', 'column')
            asc = cfg.get('order', 'asc') == 'asc'
            lines.append(f"    results['{nid}'] = results['{src_id}'].sort_values(by='{col}', ascending={asc})")

        elif ntype == 'rename' and src_id:
            old = cfg.get('oldName', 'old_col')
            new = cfg.get('newName', 'new_col')
            lines.append(f"    results['{nid}'] = results['{src_id}'].rename(columns={{'{old}': '{new}'}})")

        elif ntype == 'formula' and src_id:
            new_col = cfg.get('newColumn', 'new_col')
            expr = cfg.get('expression', '0')
            lines.append(f"    _df = results['{src_id}'].copy()")
            lines.append(f"    _df['{new_col}'] = _df.eval('{expr}')")
            lines.append(f"    results['{nid}'] = _df")

        elif ntype == 'remove_duplicates' and src_id:
            cols = cfg.get('columns', [])
            subset = f", subset={cols}" if cols else ""
            lines.append(f"    results['{nid}'] = results['{src_id}'].drop_duplicates({subset})")

        elif ntype == 'missing_handler' and src_id:
            strategy = cfg.get('strategy', 'drop')
            col = cfg.get('column')
            lines.append(f"    _df = results['{src_id}'].copy()")
            if col:
                if strategy == 'drop':
                    lines.append(f"    _df = _df.dropna(subset=['{col}'])")
                elif strategy == 'fill_zero':
                    lines.append(f"    _df['{col}'] = _df['{col}'].fillna(0)")
                elif strategy == 'fill_mean':
                    lines.append(f"    _df['{col}'] = _df['{col}'].fillna(_df['{col}'].mean())")
            else:
                lines.append(f"    _df = _df.dropna()")
            lines.append(f"    results['{nid}'] = _df")

        elif ntype == 'group_by' and src_id:
            gcol = cfg.get('groupByColumn', 'group_col')
            acol = cfg.get('aggregateColumn', 'agg_col')
            op = cfg.get('operation', 'sum')
            agg_name = f"{op}_{acol}"
            lines.append(f"    results['{nid}'] = results['{src_id}'].groupby('{gcol}')['{acol}'].agg('{op}').reset_index(name='{agg_name}')")

        elif ntype == 'join':
            left_id = src_id
            right_id = cfg.get('secondaryInputId')
            lk = cfg.get('leftKey', 'key')
            rk = cfg.get('rightKey', 'key')
            jt = cfg.get('joinType', 'inner')
            lines.append(f"    results['{nid}'] = pd.merge(results['{left_id}'], results['{right_id}'], left_on='{lk}', right_on='{rk}', how='{jt}')")

        elif ntype == 'profiler' and src_id:
            lines.append(f"    results['{nid}'] = results['{src_id}']  # Profiler passthrough")
            lines.append(f"    print(results['{nid}'].describe())")

        elif ntype == 'export' and src_id:
            fmt = cfg.get('format', 'csv')
            lines.append(f"    results['{src_id}'].to_{fmt}('output.{fmt}', index=False)  # Export")
            lines.append(f"    results['{nid}'] = results['{src_id}']")

        else:
            if src_id:
                lines.append(f"    results['{nid}'] = results['{src_id}'].copy()  # passthrough")
            else:
                lines.append(f"    results['{nid}'] = pd.DataFrame()  # no input")

        lines.append("")

    lines += [
        "    return results",
        "",
        "",
        "if __name__ == '__main__':",
        "    res = run_pipeline()",
        "    print('✅ Pipeline executed successfully.')",
        "    for node_id, df in res.items():",
        "        if df is not None:",
        "            print(f'  Node {node_id}: {len(df)} rows, {len(df.columns)} columns')",
    ]

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# SQL Code Generator
# ---------------------------------------------------------------------------

def generate_sql_code(pipeline):
    nodes = pipeline.nodes
    edges = pipeline.edges
    ordered = _topo_sort(nodes, edges)

    # Map node_id → CTE name
    cte_names = {}
    cte_blocks = []

    def safe_name(label, nid):
        import re
        base = re.sub(r'[^a-zA-Z0-9_]', '_', label.lower())
        short_id = nid.replace('-', '')[:6]
        name = f"cte_{base}_{short_id}"
        return name

    lines = [
        "-- ============================================================",
        "-- DataFlow Studio — Auto-generated SQL Query",
        f"-- Pipeline: {pipeline.name}",
        "-- Author  : Ummay Maimona Chaman",
        "-- ============================================================",
        "",
        "WITH",
    ]

    for i, node in enumerate(ordered):
        nid = node['id']
        data = node.get('data', {})
        ntype = data.get('type')
        cfg = data.get('config') or {}
        label = data.get('label', ntype)
        inputs = [e for e in edges if e['target'] == nid]
        src_id = inputs[0]['source'] if inputs else None
        src_cte = cte_names.get(src_id, 'source_data') if src_id else 'source_data'

        cte_name = safe_name(label, nid)
        cte_names[nid] = cte_name

        block_lines = [f"-- {label} ({ntype})"]

        if ntype == 'source':
            fname = cfg.get('fileName', 'your_table').replace('.csv', '').replace('.xlsx', '').replace('.json', '')
            tname = fname.replace('-', '_').replace(' ', '_').lower()
            block_lines.append(f"{cte_name} AS (")
            block_lines.append(f"    SELECT * FROM {tname}")
            block_lines.append(")")

        elif ntype == 'filter':
            col = cfg.get('column', 'column')
            op = cfg.get('operator', 'equals')
            val = cfg.get('value', '')
            if op == 'equals':
                condition = f"{col} = '{val}'"
            elif op == 'contains':
                condition = f"LOWER(CAST({col} AS TEXT)) LIKE '%{val.lower()}%'"
            elif op == 'gt':
                condition = f"CAST({col} AS DECIMAL) > {val}"
            elif op == 'lt':
                condition = f"CAST({col} AS DECIMAL) < {val}"
            else:
                condition = "1=1 -- unsupported operator"
            block_lines.append(f"{cte_name} AS (")
            block_lines.append(f"    SELECT * FROM {src_cte}")
            block_lines.append(f"    WHERE {condition}")
            block_lines.append(")")

        elif ntype == 'sort':
            col = cfg.get('column', 'column')
            order = 'ASC' if cfg.get('order', 'asc') == 'asc' else 'DESC'
            block_lines.append(f"{cte_name} AS (")
            block_lines.append(f"    SELECT * FROM {src_cte}")
            block_lines.append(f"    ORDER BY {col} {order}")
            block_lines.append(")")

        elif ntype == 'rename':
            old = cfg.get('oldName', 'old_col')
            new = cfg.get('newName', 'new_col')
            block_lines.append(f"{cte_name} AS (")
            block_lines.append(f"    SELECT * REPLACE ({old} AS {new}) FROM {src_cte}")
            block_lines.append(")")

        elif ntype == 'formula':
            new_col = cfg.get('newColumn', 'new_col')
            expr = cfg.get('expression', '0')
            block_lines.append(f"{cte_name} AS (")
            block_lines.append(f"    SELECT *, ({expr}) AS {new_col} FROM {src_cte}")
            block_lines.append(")")

        elif ntype == 'remove_duplicates':
            cols = cfg.get('columns', [])
            if cols:
                partition_by = ', '.join(cols)
                block_lines.append(f"{cte_name} AS (")
                block_lines.append(f"    SELECT * FROM (")
                block_lines.append(f"        SELECT *, ROW_NUMBER() OVER (PARTITION BY {partition_by} ORDER BY (SELECT NULL)) AS _rn")
                block_lines.append(f"        FROM {src_cte}")
                block_lines.append(f"    ) t WHERE _rn = 1")
                block_lines.append(")")
            else:
                block_lines.append(f"{cte_name} AS (")
                block_lines.append(f"    SELECT DISTINCT * FROM {src_cte}")
                block_lines.append(")")

        elif ntype == 'missing_handler':
            col = cfg.get('column')
            strategy = cfg.get('strategy', 'drop')
            block_lines.append(f"{cte_name} AS (")
            if col and strategy == 'drop':
                block_lines.append(f"    SELECT * FROM {src_cte} WHERE {col} IS NOT NULL")
            elif col and strategy == 'fill_zero':
                block_lines.append(f"    SELECT * REPLACE (COALESCE({col}, 0) AS {col}) FROM {src_cte}")
            else:
                block_lines.append(f"    SELECT * FROM {src_cte} WHERE 1=1 -- handle missing values")
            block_lines.append(")")

        elif ntype == 'group_by':
            gcol = cfg.get('groupByColumn', 'group_col')
            acol = cfg.get('aggregateColumn', 'agg_col')
            op = cfg.get('operation', 'sum').upper()
            agg_name = f"{op.lower()}_{acol}"
            block_lines.append(f"{cte_name} AS (")
            block_lines.append(f"    SELECT {gcol}, {op}({acol}) AS {agg_name}")
            block_lines.append(f"    FROM {src_cte}")
            block_lines.append(f"    GROUP BY {gcol}")
            block_lines.append(")")

        elif ntype == 'join':
            right_id = cfg.get('secondaryInputId')
            right_cte = cte_names.get(right_id, 'right_table') if right_id else 'right_table'
            lk = cfg.get('leftKey', 'key')
            rk = cfg.get('rightKey', 'key')
            jt = cfg.get('joinType', 'inner').upper()
            block_lines.append(f"{cte_name} AS (")
            block_lines.append(f"    SELECT l.*, r.*")
            block_lines.append(f"    FROM {src_cte} l")
            block_lines.append(f"    {jt} JOIN {right_cte} r ON l.{lk} = r.{rk}")
            block_lines.append(")")

        else:
            block_lines.append(f"{cte_name} AS (")
            block_lines.append(f"    SELECT * FROM {src_cte}  -- {ntype} passthrough")
            block_lines.append(")")

        cte_blocks.append("\n".join(block_lines))

    # Join CTEs with commas
    lines.append((",\n\n").join(cte_blocks))
    lines.append("")
    # Final SELECT from the last CTE
    if cte_names:
        final_cte = list(cte_names.values())[-1]
        lines.append(f"SELECT * FROM {final_cte};")
    else:
        lines.append("SELECT 'No nodes in pipeline' AS message;")

    return "\n".join(lines)
