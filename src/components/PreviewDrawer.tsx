import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Table as TableIcon, BarChart3, Terminal, Download, FileText, Code, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

import { useStore } from '../store/useStore';

export const PreviewDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { nodes, selectedNode: selectedId, executionResults, executionLogs, activePipelineId, executionStats } = useStore();
  const [tab, setTab] = useState<'data' | 'viz' | 'logs' | 'stats'>('data');
  const [vizType, setVizType] = useState<'line' | 'bar' | 'pie'>('line');

  const selectedNode = nodes.find(n => n.id === selectedId);
  const resultObj = (executionResults as any)[selectedId || ''];
  const previewData = (resultObj?.data || []).slice(0, 50);
  const nodeStats = (executionStats as any)[selectedId || '']?.stats;
  const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  const handleExport = (format: string) => {
    if (!activePipelineId || !selectedId) return;
    window.open(`/api/export/${activePipelineId}/${selectedId}/${format}/`);
  };

  const [sqlExport, setSqlExport] = useState<string | null>(null);
  const fetchSql = async () => {
    if (!activePipelineId) return;
    const res = await fetch(`/api/pipelines/${activePipelineId}/sql/`);
    const data = await res.json();
    setSqlExport(data.code);
    setTab('logs');
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <motion.div
      animate={{ height: isOpen ? '40vh' : '40px' }}
      className="absolute bottom-0 left-72 right-0 bg-[#0a150a] border-t border-emerald-900 shadow-[0_-20px_40px_rgba(0,0,0,0.4)] z-30 overflow-hidden flex flex-col"
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 flex items-center justify-between px-6 cursor-pointer hover:bg-emerald-950/30 transition-colors shrink-0"
      >
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-bold">Data Observer</span>
          {previewData.length > 0 && (
             <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-800">
               Live: {previewData.length} records
             </span>
          )}
          <div className="flex gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isOpen && activePipelineId && (
            <div className="flex items-center gap-2 mr-4">
               <button onClick={(e) => { e.stopPropagation(); handleExport('csv'); }} className="text-[9px] font-bold text-emerald-500/50 hover:text-emerald-400 flex items-center gap-1 border border-emerald-900/30 px-2 py-1 rounded bg-[#050a05]">
                 <Download size={10} /> CSV
               </button>
               <button onClick={(e) => { e.stopPropagation(); handleExport('xlsx'); }} className="text-[9px] font-bold text-emerald-500/50 hover:text-emerald-400 flex items-center gap-1 border border-emerald-900/30 px-2 py-1 rounded bg-[#050a05]">
                 <FileText size={10} /> EXCEL
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); fetchSql(); }} 
                 className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 border border-blue-900/50 px-2.5 py-1 rounded bg-blue-950/20 transition-all hover:border-blue-400"
               >
                 <Code size={10} /> SQL
               </button>
               <button 
                 onClick={async (e) => { 
                   e.stopPropagation();                    const res = await fetch(`/api/pipelines/${activePipelineId}/sql/?format=python`);
                    const data = await res.json();
                    setSqlExport(data.code);
                    setTab('logs');
                 }} 
                 className="text-[9px] font-bold text-yellow-500/50 hover:text-yellow-400 flex items-center gap-1 border border-yellow-900/30 px-2.5 py-1 rounded bg-[#050a05]"
               >
                 <FileCode size={10} /> PYTHON
               </button>
            </div>
          )}
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex border-b border-emerald-900/50 px-6">
          <button 
            onClick={() => setTab('data')}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${tab === 'data' ? 'border-emerald-500 text-emerald-50' : 'border-transparent text-emerald-500/50'}`}
          >
            <div className="flex items-center gap-2"><TableIcon size={14} /> Grid Preview</div>
          </button>
          <button 
            onClick={() => setTab('viz')}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${tab === 'viz' ? 'border-emerald-500 text-emerald-50' : 'border-transparent text-emerald-500/50'}`}
          >
            <div className="flex items-center gap-2"><BarChart3 size={14} /> Analytics</div>
          </button>
          <button 
            onClick={() => setTab('stats')}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${tab === 'stats' ? 'border-emerald-500 text-emerald-50' : 'border-transparent text-emerald-500/50'}`}
          >
            <div className="flex items-center gap-2"><BarChart3 size={14} className="text-pink-500" /> Profiler</div>
          </button>
          {tab === 'viz' && (
            <div className="flex items-center gap-1 ml-4 border-l border-emerald-900/50 pl-4 py-1">
              <button 
                onClick={() => setVizType('line')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${vizType === 'line' ? 'bg-emerald-500 text-emerald-950' : 'text-emerald-500/50'}`}
              >LINE</button>
              <button 
                onClick={() => setVizType('bar')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${vizType === 'bar' ? 'bg-emerald-500 text-emerald-950' : 'text-emerald-500/50'}`}
              >BAR</button>
              <button 
                onClick={() => setVizType('pie')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${vizType === 'pie' ? 'bg-emerald-500 text-emerald-950' : 'text-emerald-500/50'}`}
              >PIE</button>
            </div>
          )}
          <button 
            onClick={() => setTab('logs')}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${tab === 'logs' ? 'border-emerald-500 text-emerald-50' : 'border-transparent text-emerald-500/50'}`}
          >
            <div className="flex items-center gap-2"><Terminal size={14} /> Logs</div>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {tab === 'data' && (
            previewData.length > 0 ? (
              <table className="w-full text-xs font-mono border-collapse min-w-max">
                <thead>
                  <tr className="text-emerald-500/50 border-b border-emerald-900">
                    {columns.map(col => (
                      <th key={col} className="text-left py-2 px-4 uppercase tracking-tighter italic border-r border-emerald-900/30">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="border-b border-emerald-950 hover:bg-emerald-900/10 transition-colors">
                      {columns.map(col => (
                        <td key={col} className="py-2 px-4 text-emerald-400 border-r border-emerald-900/10 truncate max-w-[200px]">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-emerald-900 gap-4">
                <TableIcon size={48} className="opacity-20" />
                <p className="text-sm font-mono uppercase tracking-widest opacity-40">No data available for selected node</p>
              </div>
            )
          )}

          {tab === 'viz' && (
            <div className="h-full w-full min-h-[250px] py-4">
              {previewData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {vizType === 'line' ? (
                    <LineChart data={previewData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                      <XAxis dataKey={columns[0]} stroke="#059669" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#059669" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a150a', border: '1px solid #064e3b', borderRadius: '8px' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Line type="monotone" dataKey={columns[1] || columns[0]} stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                    </LineChart>
                  ) : vizType === 'bar' ? (
                    <BarChart data={previewData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                      <XAxis dataKey={columns[0]} stroke="#059669" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#059669" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a150a', border: '1px solid #064e3b', borderRadius: '8px' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Bar dataKey={columns[1] || columns[0]} fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={previewData}
                        dataKey={columns[1] || columns[0]}
                        nameKey={columns[0]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        stroke="none"
                      >
                        {previewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a150a', border: '1px solid #064e3b', borderRadius: '8px' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-emerald-900 gap-4">
                  <BarChart3 size={48} className="opacity-20" />
                  <p className="text-sm font-mono uppercase tracking-widest opacity-40">No data available for visualization</p>
                </div>
              )}
            </div>
          )}

          {tab === 'logs' && (
            <div className="space-y-4 font-mono text-[11px] h-full overflow-y-auto custom-scrollbar p-6">
              {sqlExport ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-blue-400 font-bold uppercase tracking-widest">Generated Logic Stream</p>
                    <button 
                      onClick={() => setSqlExport(null)}
                      className="text-emerald-900 hover:text-emerald-500 text-[10px]"
                    >
                      CLEAR
                    </button>
                  </div>
                  <pre className="p-4 bg-black/50 border border-emerald-900/50 rounded-lg text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                    {sqlExport}
                  </pre>
                </div>
              ) : (
                <div className="space-y-1">
                  {executionLogs.map((log, i) => (
                    <div key={i} className={`flex gap-3 ${log.startsWith('CRITICAL') ? 'text-red-400' : log.includes('---') ? 'text-yellow-400 mt-4 font-bold' : 'text-emerald-500/70'}`}>
                      <span className="text-emerald-900 shrink-0">[{i+1}]</span>
                      <pre className="whitespace-pre-wrap">{log}</pre>
                    </div>
                  ))}
                  {executionLogs.length === 0 && (
                    <div className="text-emerald-900 italic text-center py-10">No execution logs found. Run the pipeline to see results.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'stats' && (
            <div className="h-full overflow-auto custom-scrollbar">
              {nodeStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(nodeStats as any).map(([col, data]: [string, any]) => (
                    <div key={col} className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50 hover:border-emerald-500 transition-all">
                      <h4 className="text-xs font-bold text-emerald-100 mb-3 border-b border-emerald-900/50 pb-2 flex justify-between">
                         {col}
                         <span className="text-[9px] text-emerald-500 bg-emerald-950/50 px-1 rounded">{data.type}</span>
                      </h4>
                      <div className="space-y-1.5">
                         {[
                           { label: 'COUNT', value: data.count },
                           { label: 'UNIQUE', value: data.unique },
                           { label: 'NULLS', value: data.nulls },
                           { label: 'AVG', value: data.avg?.toFixed(2), hidden: data.avg === undefined },
                           { label: 'RANGE', value: data.min !== undefined ? `${data.min} - ${data.max}` : null, hidden: data.min === undefined },
                         ].map((item, idx) => !item.hidden && (
                           <div key={idx} className="flex justify-between text-[10px] font-mono">
                             <span className="text-emerald-900">{item.label}</span>
                             <span className="text-emerald-400">{item.value}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-emerald-900 gap-4 opacity-40">
                  <BarChart3 size={48} />
                  <p className="text-sm font-mono uppercase tracking-widest">No profile statistics for this node. Use Profiler node.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
