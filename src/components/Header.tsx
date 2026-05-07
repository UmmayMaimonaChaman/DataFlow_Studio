import React from 'react';
import { Save, Play } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Header = () => {
  const { savePipeline, runPipeline, isLoading } = useStore();

  return (
    <header className="h-16 border-b border-emerald-900 bg-[#0a150a] flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-[#050a05] font-black italic shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          DF
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-emerald-50">DataFlow <span className="opacity-40 font-light">Studio</span></h1>
          <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Visual ETL Engine v2.4</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => savePipeline('New Pipeline')}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-emerald-800 hover:bg-emerald-900 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <Save size={14} /> Save
        </button>
        <button 
          onClick={runPipeline}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 rounded-md bg-emerald-600 text-[#050a05] hover:bg-emerald-500 transition-colors text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
           {isLoading ? <span className="animate-spin truncate h-4 w-4 border-2 border-[#050a05] border-t-transparent rounded-full block"></span> : <><Play size={14} fill="currentColor" /> Run Pipeline</>}
        </button>
      </div>
    </header>
  );
};
