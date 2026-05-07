import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Database, Filter, Settings, Layers, ArrowUpAz, Download,
  GitMerge, Group, Trash2, ShieldAlert, Binary, Globe, Server,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

const iconMap: Record<string, any> = {
  source: Database,
  filter: Filter,
  sort: ArrowUpAz,
  rename: Settings,
  join: GitMerge,
  group_by: Group,
  aggregate: Layers,
  remove_duplicates: Trash2,
  missing_handler: ShieldAlert,
  formula: Binary,
  export: Download,
  api_fetch: Globe,
  sql_connector: Server,
};

export const CustomNode = memo(({ data, selected }: any) => {
  const Icon = iconMap[data.type] || Database;
  const hasErrors = data.error || (data.validationErrors && data.validationErrors.length > 0);

  return (
    <div className={clsx(
      'px-4 py-3 rounded-xl shadow-2xl border-2 transition-all duration-300 min-w-[200px]',
      'bg-[#0a150a]/90 backdrop-blur-md text-emerald-50',
      selected ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105' : 'border-emerald-900',
      hasErrors ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''
    )}>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-[#0a150a]" />
      
      <div className="flex items-center gap-3">
        <div className={clsx(
          "p-2.5 rounded-lg transition-colors",
          hasErrors ? "bg-red-500/10 text-red-400" : "bg-emerald-950/50 text-emerald-400"
        )}>
          <Icon size={20} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 leading-none mb-1">{data.type.replace('_', ' ')}</p>
          <p className="text-sm font-bold font-sans truncate">{data.label}</p>
        </div>
        {hasErrors && (
          <div className="text-red-500 animate-pulse">
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      {hasErrors && data.validationErrors && (
        <div className="mt-2 p-2 rounded bg-red-950/30 border border-red-900/50">
          {data.validationErrors.map((err: string, i: number) => (
            <p key={i} className="text-[9px] text-red-400 font-mono leading-tight flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full" /> {err}
            </p>
          ))}
        </div>
      )}

      {data.preview && !hasErrors && (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-mono text-emerald-500/50">
            <span>READY</span>
            <span>{data.rowCount || (data.preview?.length || 0)} ROWS</span>
          </div>
          <div className="h-1 bg-emerald-950 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full opacity-50" />
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-[#0a150a]" />
    </div>
  );
});
