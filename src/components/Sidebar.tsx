import React, { useState, useMemo } from 'react';
import { 
  Database, Plus, Settings, Layers, ArrowUpAz, Download, Search, 
  GitMerge, Group, Trash2, ShieldAlert, Binary, Globe, Server, 
  Undo2, Redo2, Save, Sparkles
} from 'lucide-react';
import { useStore, NodeType } from '../store/useStore';

const CATEGORIES = [
  {
    title: 'Input / Connectors',
    items: [
      { type: 'source', label: 'CSV / Excel', icon: Database },
      { type: 'api_fetch', label: 'API Fetch', icon: Globe },
      { type: 'sql_connector', label: 'SQL Connector', icon: Server },
    ]
  },
  {
    title: 'Transformation',
    items: [
      { type: 'filter', label: 'Filter', icon: Plus },
      { type: 'sort', label: 'Sort', icon: ArrowUpAz },
      { type: 'rename', label: 'Rename', icon: Settings },
      { type: 'formula', label: 'Formula Column', icon: Binary },
      { type: 'join', label: 'Join / Merge', icon: GitMerge },
    ]
  },
  {
    title: 'Data Cleaning',
    items: [
      { type: 'remove_duplicates', label: 'Remove Duplicates', icon: Trash2 },
      { type: 'missing_handler', label: 'Missing Handler', icon: ShieldAlert },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { type: 'group_by', label: 'Group By', icon: Group },
      { type: 'aggregate', label: 'Aggregate', icon: Layers },
    ]
  },
  {
    title: 'Output',
    items: [
      { type: 'export', label: 'Export Data', icon: Download },
    ]
  }
];

export const Sidebar = () => {
  const { addNode, uploadFile, deleteFile, undo, redo, savePipeline, history, future, files, selectedNode, addMagicNode, nodes, isUploading, addNodeWithMagic } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadFile(file);
      alert(`File "${file.name}" uploaded successfully!`);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. Please check file format and size.');
    }
  };

  const filteredCategories = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchTerm]);

  return (
    <aside className="w-72 border-r border-emerald-900 bg-[#0a150a] flex flex-col h-full">
      {/* Search & Actions */}
      <div className="p-4 border-b border-emerald-900/50 space-y-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex gap-1">
            <button 
              onClick={undo}
              disabled={history.length === 0}
              className="p-1.5 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 disabled:opacity-30 transition-colors"
              title="Undo"
            >
              <Undo2 size={14} />
            </button>
            <button 
              onClick={redo}
              disabled={future.length === 0}
              className="p-1.5 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 disabled:opacity-30 transition-colors"
              title="Redo"
            >
              <Redo2 size={14} />
            </button>
          </div>
          <button 
            onClick={() => savePipeline()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-emerald-950 text-[10px] font-bold hover:bg-emerald-400 transition-all uppercase tracking-wider"
          >
            <Save size={12} />
            Save
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50" size={14} />
          <input 
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-emerald-950/30 border border-emerald-900 rounded-lg py-2 pl-9 pr-4 text-xs text-emerald-400 placeholder:text-emerald-500/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="mb-6">
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-emerald-900/10 border border-emerald-900/50 border-dashed group hover:border-emerald-500/30 transition-colors cursor-pointer relative">
             <div className="flex items-center justify-between">
               <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Fast Ingest</p>
               <Plus size={12} className="text-emerald-500 animate-pulse" />
             </div>
             <label className="block relative cursor-pointer group">
               <input type="file" 
                 onChange={handleQuickUpload}
                 accept=".csv,.xlsx,.xls,.json"
                 className="hidden" 
                 id="file-upload-input"
               />
               <label htmlFor="file-upload-input" className="flex flex-col items-center justify-center gap-2 py-4 px-3 bg-emerald-950/20 rounded-xl border-2 border-dashed border-emerald-900/50 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 transition-all cursor-pointer relative overflow-hidden">
                  {isUploading && (
                    <div className="absolute inset-0 bg-emerald-950/80 flex flex-col items-center justify-center z-20">
                       <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                       <span className="text-[8px] font-bold text-emerald-500 animate-pulse uppercase tracking-[0.2em]">Uploading...</span>
                    </div>
                  )}
                  <div className="p-2 rounded-full bg-emerald-900/30 text-emerald-500 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <div className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider">
                    Import New Data
                  </div>
                  <div className="text-[8px] text-emerald-900 font-mono">
                    CSV, EXCEL, JSON
                  </div>
               </label>
             </label>
             
             {files.length > 0 && (
               <div className="mt-4 space-y-2">
                 <div className="flex items-center justify-between px-1">
                   <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Data Assets</p>
                   <span className="text-[8px] text-emerald-900">{files.length} Total</span>
                 </div>
                 <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                   {files.map(f => (
                     <div key={f.id} className="group relative bg-[#050a05] border border-emerald-900/30 rounded p-2 hover:border-emerald-500/50 transition-all">
                       <div className="flex items-center gap-2">
                         <div className="p-1 rounded bg-emerald-900/20">
                           <Database size={10} className="text-emerald-500" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-[10px] text-emerald-100 truncate font-medium">{f.original_name}</p>
                           <p className="text-[8px] text-emerald-500/50 font-mono">
                             {(f.size / 1024 / 1024).toFixed(2)} MB • {new Date(f.uploaded_at).toLocaleDateString()}
                           </p>
                         </div>
                         <button 
                           onClick={(e) => { e.stopPropagation(); if(confirm('Delete this file?')) deleteFile(f.id); }}
                           className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-emerald-900"
                         >
                           <Trash2 size={10} />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>

        {selectedNode && (
          <div className="mb-8 p-1 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={14} className="animate-pulse" />
                  </div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-400">Magic Previewer</h3>
                </div>
                <div className="text-[8px] font-mono text-emerald-500/40 uppercase">Active Selection</div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] text-emerald-100/60 leading-relaxed italic">
                  Suggested follow-up for <span className="text-emerald-400 font-bold">{selectedNodeData?.data.label}</span>
                </p>
                <button 
                  onClick={() => addMagicNode(selectedNode)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles size={12} />
                  Generate Magic Node
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredCategories.map((cat, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-[10px] font-mono text-emerald-500/40 uppercase tracking-[0.2em] mb-3 px-2">
              {cat.title}
            </h2>
            <div className="grid gap-2">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.type} className="group relative">
                    <button
                      onClick={() => addNode(item.type as NodeType, { x: 100, y: 100 + (nodes.length * 20) })}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-emerald-900/30 bg-[#050a05] hover:border-emerald-500/50 cursor-pointer transition-all text-left w-full hover:bg-emerald-900/10"
                    >
                      <div className="p-1.5 rounded bg-emerald-950/50 text-emerald-500/70 group-hover:text-emerald-400 transition-colors">
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-medium text-emerald-100/70 group-hover:text-emerald-50 transition-colors">
                        {item.label}
                      </span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addNodeWithMagic(item.type as NodeType);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-emerald-500/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Add with Magic"
                    >
                      <Sparkles size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-emerald-900 font-mono italic">No components found</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-emerald-900 bg-[#050a05]">
        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em] text-emerald-900">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE</span>
          <span>made by Ummay Maimona Chaman</span>
        </div>
      </div>
    </aside>
  );
};
