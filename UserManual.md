# DataFlow Studio User Manual

Welcome to DataFlow Studio. This guide will walk you through building your first visual data pipeline.

## 1. Getting Started
- Launch the application from your browser.
- You'll see the **Visual Canvas** in the center and the **Core Nodes** sidebar on the left.

## 2. Building a Pipeline
### Step A: Adding a Source
- Drag the **CSV/Excel Source** node onto the canvas.
- Click the node to open the **Config Panel** on the right.
- Select your dataset from the dropdown or use the upload area in the sidebar to add a new file.

### Step B: Adding Transformations
- Add a **Filter** node and connect the output of the Source node to the input of the Filter node.
- Configure the filter conditions (e.g., `Price > 100`).
- Add a **Sort** or **Rename** node to refine your data further.

### Step C: Aggregation
- Use the **Aggregate** node to summarize your data.
- Specify the grouping column and the operation (e.g., `SUM` of `Profit`).

### Step D: Exporting
- Add an **Export Data** node at the end of your chain.
- This represents the terminal point of your ETL logic.

## 3. Monitoring & Analytics
- Click the **Data Observer** bar at the bottom to expand the preview window.
- **Grid Preview**: View the raw transformed data rows.
- **Analytics**: See visual trends and distributions of your pipeline output.
- **Logs**: Monitor internal engine execution states and warnings.

## 4. Saving & Running
- Use the **Save** button in the header to persist your pipeline structure.
- Click **Run Pipeline** to execute the full transformation logic on the server.

## 5. Troubleshooting
- **Orphaned Nodes**: Ensure all nodes are connected. Disconnected nodes will not be executed.
- **Type Mismatch**: If a filter fails, ensure the column values match the expected data type.
- **Large Files**: For files over 50MB, processing may take longer depending on worker priority.

---

**made by CHAMAN**
