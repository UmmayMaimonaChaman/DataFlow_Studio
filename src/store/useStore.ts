import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, Connection, Edge, EdgeChange, Node, NodeChange, OnConnect, OnEdgesChange, OnNodesChange } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

export type NodeType = 
  | 'source' 
  | 'filter' 
  | 'sort' 
  | 'rename' 
  | 'join' 
  | 'group_by' 
  | 'aggregate' 
  | 'remove_duplicates' 
  | 'missing_handler' 
  | 'formula' 
  | 'export' 
  | 'api_fetch' 
  | 'sql_connector'
  | 'branch'
  | 'parameter'
  | 'profiler';

export interface PipelineNode extends Node {
  data: {
    label: string;
    type: NodeType;
    config: any;
    rowCount?: number;
    preview?: any[];
    error?: string;
    validationErrors?: string[];
  };
}

interface HistoryState {
  nodes: PipelineNode[];
  edges: Edge[];
}

interface PipelineState {
  nodes: PipelineNode[];
  edges: Edge[];
  selectedNode: string | null;
  files: any[];
  pipelines: any[];
  activePipelineId: string | null;
  isLoading: boolean;
  isUploading: boolean;
  history: HistoryState[];
  future: HistoryState[];
  executionResults: Record<string, any[]>;
  executionStats: Record<string, { duration: number, rowCount: number, stats?: any }>;
  executionLogs: string[];
  variables: Record<string, any>;
  schedule: { frequency: string, enabled: boolean } | null;
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  setNodes: (nodes: PipelineNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (type: NodeType, position: { x: number, y: number }) => void;
  updateNodeData: (id: string, data: any) => void;
  setSelectedNode: (id: string | null) => void;
  
  fetchFiles: () => Promise<void>;
  fetchPipelines: () => Promise<void>;
  savePipeline: (name?: string) => Promise<void>;
  loadPipeline: (id: string) => void;
  runPipeline: () => Promise<void>;
  uploadFile: (file: File) => Promise<any>;
  renameActivePipeline: (newName: string) => void;
  setVariables: (vars: Record<string, any>) => void;
  setSchedule: (sched: { frequency: string, enabled: boolean } | null) => void;
  
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;
  
  deleteFile: (id: string) => Promise<void>;
  deletePipeline: (id: string) => Promise<void>;
  createNewPipeline: () => void;
  addMagicNode: (parentId: string) => void;
  addNodeWithMagic: (type: NodeType) => void;
}

export const useStore = create<PipelineState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  files: [],
  pipelines: [],
  activePipelineId: null,
  isLoading: false,
  isUploading: false,
  history: [],
  future: [],
  executionResults: {},
  executionStats: {},
  executionLogs: [],
  variables: {},
  schedule: null,

  pushToHistory: () => {
    const { nodes, edges, history } = get();
    // Simple limit for history
    const newHistory = [...history, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }].slice(-20);
    set({ history: newHistory, future: [] });
  },

  undo: () => {
    const { history, future, nodes, edges } = get();
    if (history.length === 0) return;
    
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const newFuture = [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...future];
    
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      history: newHistory,
      future: newFuture
    });
  },

  redo: () => {
    const { history, future, nodes, edges } = get();
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    const newHistory = [...history, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
    
    set({
      nodes: next.nodes,
      edges: next.edges,
      history: newHistory,
      future: newFuture
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    const nextNodes = applyNodeChanges(changes, get().nodes) as PipelineNode[];
    set({ nodes: nextNodes });
    
    changes.forEach((change) => {
      if (change.type === 'select') {
        if (change.selected) {
          set({ selectedNode: change.id });
        } else if (get().selectedNode === change.id) {
          set({ selectedNode: null });
        }
      }
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    get().pushToHistory();
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    get().pushToHistory();
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (type, position) => {
    get().pushToHistory();
    const newNode: PipelineNode = {
      id: uuidv4(),
      type: 'customNode',
      position,
      data: {
        label: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type,
        config: {},
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },

  setSelectedNode: (id) => set({ selectedNode: id }),

  fetchFiles: async () => {
    try {
      const res = await fetch('/api/files/');
      const data = await res.json();
      set({ files: data });
    } catch (e) {
      console.error('Failed to fetch files', e);
    }
  },

  fetchPipelines: async () => {
    try {
      const res = await fetch('/api/pipelines/');
      const data = await res.json();
      set({ pipelines: data });
    } catch (e) {
      console.error('Failed to fetch pipelines', e);
    }
  },

  savePipeline: async (name) => {
    const { nodes, edges, activePipelineId, pipelines } = get();
    const currentPipeline = pipelines.find(p => p.id === activePipelineId);
    const finalName = name || currentPipeline?.name || 'Untitled Pipeline';
    
    const method = activePipelineId ? 'PUT' : 'POST';
    const url = activePipelineId ? `/api/pipelines/${activePipelineId}/` : '/api/pipelines/';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: finalName, nodes, edges }),
      });
      const data = await res.json();
      if (!activePipelineId) {
        set({ activePipelineId: data.id });
      }
      get().fetchPipelines();
    } catch (e) {
      console.error('Failed to save pipeline', e);
    }
  },

  loadPipeline: (id) => {
    const pipeline = get().pipelines.find((p) => p.id === id);
    if (pipeline) {
      set({
        nodes: pipeline.nodes,
        edges: pipeline.edges,
        activePipelineId: pipeline.id,
      });
    }
  },

  runPipeline: async () => {
    const { activePipelineId, nodes, edges, variables } = get();
    if (!activePipelineId) return;
    
    // Auto-select files for source nodes if missing
    const { files } = get();
    let updated = false;
    const nextNodes = nodes.map(node => {
      if (node.data.type === 'source' && !node.data.config.fileId && files.length > 0) {
        updated = true;
        return {
          ...node,
          data: {
            ...node.data,
            label: `Source: ${files[0].original_name}`,
            config: { ...node.data.config, fileId: files[0].id }
          }
        };
      }
      return node;
    });

    if (updated) {
      set({ nodes: nextNodes });
    }

    const validationErrors: Record<string, string[]> = {};
    nextNodes.forEach(node => {
      if (node.data.type === 'source' && !node.data.config.fileId) {
        validationErrors[node.id] = ["Please select a file in the configuration panel"];
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      set({ 
        nodes: nodes.map(n => ({
          ...n, 
          data: { ...n.data, validationErrors: validationErrors[n.id] || [] } 
        }))
      });
      set({ executionLogs: ["Validation Failed: Source nodes require a selected file."] });
      return;
    }
    
    set({ isLoading: true, executionLogs: ['Engine Initializing...'] });
    try {
      const res = await fetch(`/api/pipelines/${activePipelineId}/run/`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables })
      });
      const result = await res.json();
      
      if (result.status === 'success') {
         // Re-fetch pipeline to get sampled results
         const freshRes = await fetch(`/api/pipelines/${activePipelineId}/`);
         const data = await freshRes.json();
      
         if (freshRes.ok) {
           set({ 
             nodes: nodes.map(n => {
               const nodeResult = data.results[n.id];
               return {
                 ...n,
                 data: {
                   ...n.data,
                   preview: nodeResult ? nodeResult.data : [],
                   rowCount: nodeResult ? nodeResult.rowCount : 0
                 }
               };
             }),
             executionResults: data.results || {},
             executionLogs: data.logs || [],
             executionStats: result.executionStats || {},
             isLoading: false
           });
         }
      }
    } catch (e) {
      console.error('Pipeline run failed', e);
      set({ executionLogs: ['CRITICAL: Execution failed.'] });
    } finally {
      set({ isLoading: false });
    }
  },

  setVariables: (vars: Record<string, any>) => set({ variables: vars }),
  setSchedule: (sched: { frequency: string, enabled: boolean } | null) => set({ schedule: sched }),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    set({ isUploading: true });
    try {
      const res = await fetch('/api/files/upload/', { 
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok && !data.file) {
          throw new Error(data.error || 'Upload failed');
      }
      
      get().fetchFiles();
      
      // Auto-add Source node for the new file if we have a file ID
      if (data.file && data.file.id) {
          const currentNodes = get().nodes;
          const newNodeId = uuidv4();
          set({
            nodes: [
              ...currentNodes,
              {
                id: newNodeId,
                type: 'customNode',
                position: { x: 100, y: 100 + (currentNodes.length * 25) },
                data: {
                  label: `Source: ${file.name}`,
                  type: 'source',
                  config: { fileId: data.file.id },
                  preview: data.preview || []
                }
              }
            ]
          });
      }
      
      return data;
    } catch (e) {
      console.error('File upload failed', e);
      throw e;
    } finally {
      set({ isUploading: false });
    }
  },

  deleteFile: async (id: string) => {
    try {
      // We don't have a specific delete endpoint yet, so we'll add one to Django
      // or just filter locally if we want to be quick, but better to hit the API.
      await fetch(`/api/files/${id}/`, { method: 'DELETE' });
      get().fetchFiles();
    } catch (e) {
      console.error('Delete file failed', e);
    }
  },

  deletePipeline: async (id: string) => {
    try {
      await fetch(`/api/pipelines/${id}/`, { method: 'DELETE' });
      if (get().activePipelineId === id) {
        get().createNewPipeline();
      }
      get().fetchPipelines();
    } catch (e) {
      console.error('Delete pipeline failed', e);
    }
  },

  createNewPipeline: () => {
    set({
      nodes: [],
      edges: [],
      activePipelineId: null,
      executionResults: {},
      executionStats: {},
      executionLogs: [],
      history: [],
      future: []
    });
  },

  renameActivePipeline: (newName: string) => {
    const { activePipelineId, pipelines } = get();
    if (!activePipelineId) return;
    
    set({ pipelines: updatedPipelines });
  },

  addMagicNode: (parentId: string) => {
    const { nodes, edges, selectedNode: selectedId, executionResults, executionStats } = get();
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const resultObj = executionResults[selectedId || ''];
    const previewData = (resultObj?.data || []).slice(0, 50);
    const nodeStats = executionStats[selectedId || '']?.stats;
    const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

    get().pushToHistory();

    const parentType = parentNode.data.type;
    let successorType: NodeType = 'filter';
    
    const suggestionMap: Record<string, NodeType> = {
      'source': 'profiler',
      'api_fetch': 'filter',
      'sql_connector': 'filter',
      'filter': 'sort',
      'sort': 'group_by',
      'group_by': 'export',
      'rename': 'filter',
      'formula': 'filter',
      'remove_duplicates': 'filter',
      'missing_handler': 'filter',
      'join': 'filter',
      'profiler': 'export',
      'export': 'source' // cycle back or keep as export
    };

    successorType = suggestionMap[parentType] || 'filter';

    const newNodeId = uuidv4();
    const newNode: PipelineNode = {
      id: newNodeId,
      type: 'customNode',
      position: { x: parentNode.position.x + 300, y: parentNode.position.y },
      data: {
        label: successorType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type: successorType,
        config: {},
        preview: []
      },
    };

    const newEdge: Edge = {
      id: `e-${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 }
    };

    set({ 
      nodes: [...nodes, newNode],
      edges: [...edges, newEdge],
      selectedNode: newNodeId
    });
  },

  addNodeWithMagic: (type: NodeType) => {
    const { nodes } = get();
    const id = uuidv4();
    const position = { x: 100, y: 100 + (nodes.length * 50) };
    
    get().pushToHistory();

    const newNode: PipelineNode = {
      id,
      type: 'customNode',
      position,
      data: {
        label: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type,
        config: {},
        preview: []
      },
    };

    set({ 
      nodes: [...nodes, newNode],
      selectedNode: id
    });

    // We don't auto-add the magic node here because it might be confusing
    // but we select it so the Magic Previewer shows up immediately.
  }
}));
