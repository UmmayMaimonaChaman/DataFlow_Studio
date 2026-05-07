import React from 'react';
import { X, Trash2, Settings2, Plus, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export const ConfigPanel = () => {
  const { nodes, edges, selectedNode, setSelectedNode, updateNodeData, setNodes, files, uploadFile, addMagicNode } = useStore();
  const node = nodes.find((n) => n.id === selectedNode);

  if (!node) return null;

  const deleteNode = () => {
    setNodes(nodes.filter((n) => n.id !== selectedNode));
    setSelectedNode(null);
  };

  const handleConfigChange = (key: string, value: any) => {
    updateNodeData(node.id, { 
      config: { ...node.data.config, [key]: value } 
    });
  };

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="absolute right-0 top-0 bottom-0 w-80 bg-[#0a150a] border-l border-emerald-900 shadow-2xl z-40 flex flex-col"
    >
      <div className="p-6 border-b border-emerald-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings2 size={18} className="text-emerald-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Node Config</h2>
        </div>
        <button onClick={() => setSelectedNode(null)} className="text-emerald-500/50 hover:text-emerald-500">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Node Label</label>
          <input 
            type="text" 
            value={node.data.label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
            className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none"
          />
        </div>

        {node.data.type === 'source' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Dataset Selection</label>
              <select 
                value={node.data.config.fileId || ''}
                className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-emerald-100"
                onChange={(e) => handleConfigChange('fileId', e.target.value)}
              >
                <option value="">Select a file...</option>
                {files.map(f => (
                  <option key={f.id} value={f.id}>{f.original_name}</option>
                ))}
              </select>
            </div>
            
            <div className="pt-2">
              <label className="relative flex items-center justify-center gap-2 p-3 rounded border border-emerald-900 border-dashed hover:border-emerald-500 transition-all cursor-pointer bg-emerald-950/20 group">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const res = await uploadFile(file);
                      handleConfigChange('fileId', res.file.id);
                    }
                  }}
                  accept=".csv,.xlsx,.xls,.json"
                />
                <Plus size={14} className="text-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-500/70 group-hover:text-emerald-400 uppercase tracking-wider">Upload New File</span>
              </label>
            </div>
          </div>
        )}

        {node.data.type === 'filter' && (
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Column</label>
                <input 
                  type="text" 
                  value={node.data.config.column || ''}
                  onChange={(e) => handleConfigChange('column', e.target.value)}
                  placeholder="e.g. price" 
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm" 
                />
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Operator</label>
                <select 
                  value={node.data.config.operator || ''}
                  onChange={(e) => handleConfigChange('operator', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select...</option>
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="gt">Greater Than</option>
                  <option value="lt">Less Than</option>
                </select>
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Value</label>
                <input 
                  type="text" 
                  value={node.data.config.value || ''}
                  onChange={(e) => handleConfigChange('value', e.target.value)}
                  placeholder="e.g. 100" 
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm" 
                />
             </div>
          </div>
        )}

        {node.data.type === 'sort' && (
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Column</label>
                <input 
                  type="text" 
                  value={node.data.config.column || ''}
                  onChange={(e) => handleConfigChange('column', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm" 
                />
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Order</label>
                <select 
                  value={node.data.config.order || 'asc'}
                  onChange={(e) => handleConfigChange('order', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
             </div>
          </div>
        )}

        {node.data.type === 'formula' && (
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">New Column Name</label>
                <input 
                  type="text" 
                  value={node.data.config.newColumn || ''}
                  onChange={(e) => handleConfigChange('newColumn', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm" 
                  placeholder="e.g. total_price"
                />
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Expression</label>
                <input 
                  type="text" 
                  value={node.data.config.expression || ''}
                  onChange={(e) => handleConfigChange('expression', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm font-mono" 
                  placeholder="e.g. price * 1.05"
                />
                <p className="text-[9px] text-emerald-900 mt-1 italic">Use column names as variables.</p>
             </div>
          </div>
        )}

        {node.data.type === 'group_by' && (
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Group By</label>
                <input 
                  type="text" 
                  value={node.data.config.groupByColumn || ''}
                  onChange={(e) => handleConfigChange('groupByColumn', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm" 
                  placeholder="e.g. category"
                />
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Aggregate Column</label>
                <input 
                  type="text" 
                  value={node.data.config.aggregateColumn || ''}
                  onChange={(e) => handleConfigChange('aggregateColumn', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm" 
                  placeholder="e.g. sales"
                />
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Operation</label>
                <select 
                  value={node.data.config.operation || 'sum'}
                  onChange={(e) => handleConfigChange('operation', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm"
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Average</option>
                  <option value="count">Count</option>
                  <option value="max">Max</option>
                  <option value="min">Min</option>
                </select>
             </div>
          </div>
        )}

        {node.data.type === 'branch' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Column</label>
              <input 
                type="text"
                placeholder="column_name"
                className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-emerald-100"
                value={node.data.config.column || ''}
                onChange={(e) => handleConfigChange('column', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Operator</label>
              <select 
                className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-emerald-100"
                value={node.data.config.operator || 'equals'}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="gt">Greater Than</option>
                <option value="lt">Less Than</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Value</label>
              <input 
                type="text"
                className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-emerald-100"
                value={node.data.config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
              />
            </div>
          </div>
        )}

        {node.data.type === 'parameter' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Variable Name</label>
              <input 
                type="text"
                placeholder="VAR_NAME"
                className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-emerald-100"
                value={node.data.config.name || ''}
                onChange={(e) => handleConfigChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Default Value</label>
              <input 
                type="text"
                className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-emerald-100"
                value={node.data.config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
              />
            </div>
          </div>
        )}

        {node.data.type === 'profiler' && (
          <div className="p-4 rounded border border-emerald-900/50 bg-emerald-950/10">
            <p className="text-[10px] text-emerald-500/70 leading-relaxed">
              No configuration required. This node will automatically generate statistics for all columns during execution.
            </p>
          </div>
        )}

        {node.data.type === 'join' && (
          <div className="space-y-4">
             <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded text-[10px] text-blue-400">
               Connect two input nodes, then select which one is the secondary dataset.
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Secondary Input</label>
                <select 
                  value={node.data.config.secondaryInputId || ''}
                  onChange={(e) => handleConfigChange('secondaryInputId', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm text-emerald-100"
                >
                  <option value="">Select input node...</option>
                  {edges.filter(e => e.target === node.id).map(e => {
                    const srcNode = nodes.find(n => n.id === e.source);
                    return <option key={e.source} value={e.source}>{srcNode?.data.label || e.source}</option>;
                  })}
                </select>
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Left Key (Primary)</label>
                <input 
                  type="text" 
                  value={node.data.config.leftKey || ''}
                  onChange={(e) => handleConfigChange('leftKey', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm text-emerald-100 focus:border-emerald-500 outline-none" 
                />
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Right Key (Secondary)</label>
                <input 
                  type="text" 
                  value={node.data.config.rightKey || ''}
                  onChange={(e) => handleConfigChange('rightKey', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm text-emerald-100 focus:border-emerald-500 outline-none" 
                />
             </div>
             <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 mb-2 block">Join Type</label>
                <select 
                  value={node.data.config.joinType || 'inner'}
                  onChange={(e) => handleConfigChange('joinType', e.target.value)}
                  className="w-full bg-[#050a05] border border-emerald-900 rounded px-3 py-2 text-sm text-emerald-100 focus:border-emerald-500 outline-none"
                >
                  <option value="inner">Inner</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="outer">Outer</option>
                </select>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-emerald-900/50 space-y-3">
        <button 
          onClick={() => addMagicNode(node.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 group"
        >
          <Sparkles size={14} className="group-hover:animate-spin" /> Magic Auto-Node
        </button>
        <button 
          onClick={deleteNode}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-900/20 hover:border-red-500 transition-all text-[10px] font-bold uppercase tracking-widest"
        >
          <Trash2 size={12} /> Remove Node
        </button>
      </div>
    </motion.div>
  );
};
