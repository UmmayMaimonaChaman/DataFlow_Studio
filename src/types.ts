export type NodeData = {
  label: string;
  type: 'source' | 'filter' | 'rename' | 'clean' | 'aggregate' | 'join' | 'export';
  config: any;
  previewData?: any[];
  error?: string;
};

export type FileMetadata = {
  id: string;
  original_name: string;
  file: string;
  size: number;
  uploaded_at: string;
};

export type Pipeline = {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  created_at: string;
  updated_at: string;
};
