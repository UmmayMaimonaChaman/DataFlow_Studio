import React, { useEffect, useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Play, 
  Save, 
  Share2,
  Database,
  HelpCircle,
  Clock,
  Plus
} from 'lucide-react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { ConfigPanel } from './components/ConfigPanel';
import { PreviewDrawer } from './components/PreviewDrawer';
import { CustomNode } from './components/CustomNode';
import { HelpModal } from './components/HelpModal';

const nodeTypes = {
  customNode: CustomNode,
};

const PipelineBuilder = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    activePipelineId,
    pipelines,
    savePipeline,
    runPipeline,
    isLoading,
    fetchFiles,
    fetchPipelines,
    renameActivePipeline,
    createNewPipeline,
    schedule,
    setSchedule
  } = useStore();

  const activePipeline = pipelines.find(p => p.id === activePipelineId);

  const startEditing = () => {
    setTempName(activePipeline?.name || 'New Pipeline Instance');
    setIsEditingName(true);
  };

  const finishEditing = () => {
    if (tempName.trim()) {
      renameActivePipeline(tempName);
      savePipeline(tempName);
    }
    setIsEditingName(false);
  };

  // Auto-save effect
  useEffect(() => {
    const timer = setInterval(() => {
      savePipeline();
    }, 10000); // Auto-save every 10 seconds
    return () => clearInterval(timer);
  }, [savePipeline]);

  // Initial data fetch
  useEffect(() => {
    fetchFiles();
    fetchPipelines();
  }, [fetchFiles, fetchPipelines]);

  const handleShare = () => {
    const url = window.location.href + (activePipelineId ? `?id=${activePipelineId}` : '');
    navigator.clipboard.writeText(url);
    alert('Pipeline share link copied to clipboard!');
  };

  return (
    <div className="flex h-screen w-full bg-[#050a05] text-emerald-50 overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-14 border-b border-emerald-900/50 flex items-center justify-between px-6 bg-[#0a150a]/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded bg-emerald-900/20 border border-emerald-900/30">
              <Database size={18} className="text-emerald-500" />
            </div>
            <div>
              {isEditingName ? (
                <input
                  autoFocus
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={finishEditing}
                  onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                  className="bg-[#050a05] border border-emerald-500 rounded px-2 py-0.5 text-sm font-bold text-emerald-100 outline-none w-64"
                />
              ) : (
                <h1 
                  onClick={startEditing}
                  className="text-sm font-bold tracking-tight text-emerald-100 cursor-text hover:text-emerald-400 transition-colors"
                >
                  {activePipeline?.name || 'New Pipeline Instance'}
                </h1>
              )}
              <p className="text-[10px] text-emerald-500/50 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isLoading ? 'Processing Stream...' : 'Engine Synchronized'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-900/50 hover:border-emerald-500 transition-all text-[11px] font-bold uppercase tracking-wider text-emerald-500/70 hover:text-emerald-400"
            >
              <HelpCircle size={14} /> Guide
            </button>
            
            <div className="flex items-center border border-emerald-900/50 rounded overflow-hidden">
               <button 
                 onClick={() => setSchedule(schedule ? null : { frequency: 'Daily (00:00)', enabled: true })}
                 className={`flex items-center gap-2 px-3 py-1.5 transition-all text-[11px] font-bold uppercase tracking-wider ${schedule ? 'bg-emerald-900/30 text-emerald-400' : 'text-emerald-900'}`}
               >
                 <Clock size={14} /> {schedule ? 'Scheduled' : 'Draft'}
               </button>
            </div>

            <button 
              onClick={() => { if(confirm('Start fresh? Unsaved changes will be lost.')) createNewPipeline(); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-900/50 hover:border-emerald-500 transition-all text-[11px] font-bold uppercase tracking-wider text-emerald-500/70 hover:text-emerald-400"
            >
              <Plus size={14} /> New Pipeline
            </button>
            <button 
              onClick={() => savePipeline()}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-900/50 hover:border-emerald-500 transition-all text-[11px] font-bold uppercase tracking-wider text-emerald-500/70 hover:text-emerald-400"
            >
              <Save size={14} /> Quick Save
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-900/50 hover:border-emerald-500 transition-all text-[11px] font-bold uppercase tracking-wider text-emerald-500/70 hover:text-emerald-400"
            >
              <Share2 size={14} /> Share
            </button>
            <button 
              onClick={() => runPipeline()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[11px] font-bold uppercase tracking-wider text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] ml-2"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              {isLoading ? 'Running...' : 'Execute Pipeline'}
            </button>
          </div>
        </header>

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background color="#064e3b" gap={30} variant={"dots" as any} />
            <Controls className="!bg-[#0a150a] !border-emerald-900/50 !fill-emerald-500" />
          </ReactFlow>

          <ConfigPanel />
          <PreviewDrawer />
          <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <PipelineBuilder />
    </ReactFlowProvider>
  );
}
