import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, Play, Database, Filter, Layers, Share2, Download } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-[#0a150a] border border-emerald-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-emerald-900/50 flex items-center justify-between bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <Book className="text-emerald-500" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-emerald-100">DataFlow User Manual</h2>
                  <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-widest">Version 1.2.0 Engine Guide</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-emerald-900/50 rounded-full transition-colors">
                <X size={20} className="text-emerald-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
              <section className="space-y-6">
                <h3 className="text-emerald-400 font-bold flex items-center gap-2 border-b border-emerald-900 pb-2">
                  <Play size={18} /> 🚀 Getting Started
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-emerald-100/70">
                  <div className="p-4 rounded-xl border border-emerald-900/30 bg-emerald-950/10">
                    <p className="font-bold text-emerald-500 mb-2">1. Ingest</p>
                    <p className="text-xs">Upload your datasets (CSV, XLSX, JSON) via the Sidebar. Large files up to 100MB are supported with real-time progress indicators.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-900/30 bg-emerald-950/10">
                    <p className="font-bold text-emerald-500 mb-2">2. Map</p>
                    <p className="text-xs">Drag nodes to the canvas and connect them. Use the 'Magic' button to auto-generate the next logical step in your pipeline.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-900/30 bg-emerald-950/10">
                    <p className="font-bold text-emerald-500 mb-2">3. Execute</p>
                    <p className="text-xs">Click 'Execute Pipeline' to process your data. View results instantly in the Observer drawer or export the full dataset.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-emerald-400 font-bold flex items-center gap-2 border-b border-emerald-900 pb-2">
                  <Layers size={18} /> 🛠️ Transformation Suite
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-4 p-4 rounded-xl border border-emerald-900/30 bg-[#050a05]">
                      <div className="p-3 rounded-lg bg-blue-500/10 h-fit"><Filter className="text-blue-500" size={20} /></div>
                      <div>
                        <h4 className="font-bold text-blue-400 text-sm">Filter & Sort</h4>
                        <p className="text-[11px] text-emerald-100/60 mt-1">Use 'Equals', 'Contains', 'Greater Than', or 'Less Than' operators. Sort data ascending or descending by any column.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-xl border border-emerald-900/30 bg-[#050a05]">
                      <div className="p-3 rounded-lg bg-purple-500/10 h-fit"><Binary className="text-purple-500" size={20} /></div>
                      <div>
                        <h4 className="font-bold text-purple-400 text-sm">Custom Formulas</h4>
                        <p className="text-[11px] text-emerald-100/60 mt-1">Create new columns using math expressions like `price * 1.15`. Supports all standard Python/Pandas math operations.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-xl border border-emerald-900/30 bg-[#050a05]">
                      <div className="p-3 rounded-lg bg-emerald-500/10 h-fit"><Share2 className="text-emerald-500" size={20} /></div>
                      <div>
                        <h4 className="font-bold text-emerald-400 text-sm">Join & Group By</h4>
                        <p className="text-[11px] text-emerald-100/60 mt-1">Merge two different files using common keys. Use Group By to calculate Sums, Averages, and Counts across categories.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-xl border border-emerald-900/30 bg-[#050a05]">
                      <div className="p-3 rounded-lg bg-amber-500/10 h-fit"><Trash2 className="text-amber-500" size={20} /></div>
                      <div>
                        <h4 className="font-bold text-amber-400 text-sm">Data Cleaning</h4>
                        <p className="text-[11px] text-emerald-100/60 mt-1">Automatically remove duplicates or handle missing values (drop rows, fill with zeros, or fill with column mean).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-emerald-400 font-bold flex items-center gap-2 border-b border-emerald-900 pb-2">
                  <Sparkles size={18} /> ✨ Magic Node Automator
                </h3>
                <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 p-6 rounded-2xl border border-emerald-500/30 space-y-4">
                  <p className="text-sm text-emerald-100/80 italic font-medium">Build pipelines at the speed of thought.</p>
                  <p className="text-xs text-emerald-100/60 leading-relaxed">
                    The Magic Node system analyzes your current selection and suggests the most logical next step. 
                    If you select a <strong>Source</strong>, it suggests a <strong>Profiler</strong>. 
                    If you select a <strong>Filter</strong>, it suggests a <strong>Sort</strong>. 
                    Click the sparkles icon to instantly expand your pipeline with pre-configured connections.
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-emerald-400 font-bold flex items-center gap-2 border-b border-emerald-900 pb-2">
                  <Download size={18} /> 📊 Observation & Export
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Real-time Observer</h4>
                    <ul className="text-[11px] text-emerald-100/60 space-y-2 list-none">
                      <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"/> <strong>Grid Preview:</strong> View the first 100 rows of any step.</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"/> <strong>Analytics:</strong> Instant Line, Bar, and Pie charts.</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"/> <strong>Profiler:</strong> Deep statistical analysis of every column.</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Code & Export</h4>
                    <ul className="text-[11px] text-emerald-100/60 space-y-2 list-none">
                      <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"/> <strong>SQL/Python:</strong> Auto-generate the code for your entire pipeline.</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"/> <strong>Full Export:</strong> Download 100% of the processed data as CSV or Excel.</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-emerald-900/50 bg-emerald-950/20 text-center">
              <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-mono">
                Ummay Maimona Chaman © 2026 • Real-time Data processing Pipeline
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
