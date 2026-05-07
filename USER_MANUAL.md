# DataFlow Studio User Manual

Welcome to DataFlow Studio. This manual will guide you through building your first data pipeline.

## 1. Interface Overview
- **Left Sidebar**: Navigation between the Pipeline Builder, Stats Dashboard, and Pipeline History.
- **Top Header**: Pipeline title, Save button, and the "Run" execution trigger.
- **Center Canvas**: Your visual workspace where nodes are placed and connected.
- **Right Inspector**: Configuration panel for the currently selected node.
- **Bottom Preview**: Real-time table view of data flowing through the active node.

## 2. Building a Pipeline
1. **Add a Source Node**: Click the "Source" button in the canvas floating panel.
2. **Ingest Data**: Select the Source node, then use the Inspector on the right to upload your CSV or Excel file.
3. **Add Transformations**:
   - **Filter**: Drop a Filter node and connect it to your Source. Enter the column name and value you want to keep.
   - **Clean**: Connect a Clean node to trim whitespace or remove invalid entries.
4. **Connect Nodes**: Drag from the right handle of one node to the left handle of another to create a sequence.

## 3. Viewing Results
- Click on any node in the sequence to see the **Preview Table** at the bottom. This shows you exactly how the data looks *at that specific step*.
- Check the **Stats Dashboard** to see processing trends.

## 4. Saving and Loading
- Use the **Save** button in the header to name and store your pipeline.
- Access the **History** tab to reload past pipelines.

## 5. Expert Tips
- Use **Excel (.xlsx)** files for multi-sheet support (Source node picks the first sheet by default).

---

**made by CHAMAN**
