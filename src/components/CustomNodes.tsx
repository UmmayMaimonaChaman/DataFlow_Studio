import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Filter, Type, Sparkles, PlusSquare, FileOutput, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BaseNode = ({ icon: Icon, title, children, selected, type }: any) => {
  const colors: any = {
    source: 'border-blue-500/50 text-blue-400',
    filter: 'border-amber-500/50 text-amber-400',
    rename: 'border-purple-500/50 text-purple-400',
    clean: 'border-emerald-500/50 text-emerald-400',
    aggregate: 'border-rose-500/50 text-rose-400',
    join: 'border-indigo-500/50 text-indigo-400',
    export: 'border-emerald-600/50 text-emerald-500',
  };

  return (
    <div className={cn(
      "min-w-[180px] p-4 rounded-xl bg-[#141414] border-2 shadow-2xl transition-all duration-200",
      selected ? "border-emerald-500 scale-105" : colors[type] || "border-zinc-800"
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg bg-zinc-900/50", colors[type])}>
          <Icon size={18} />
        </div>
        <span className="font-semibold text-sm tracking-tight">{title}</span>
      </div>
      <div className="text-xs text-zinc-400 space-y-2">
        {children}
      </div>
    </div>
  );
};

export const SourceNode = memo(({ data, selected }: any) => (
  <BaseNode icon={Database} title="Data Source" type="source" selected={selected}>
    <p>{data.config?.fileName || 'No file selected'}</p>
    <Handle type="source" position={Position.Right} />
  </BaseNode>
));

export const FilterNode = memo(({ data, selected }: any) => (
  <BaseNode icon={Filter} title="Filter Rows" type="filter" selected={selected}>
    <p>{data.config?.column} {data.config?.operator} {data.config?.value}</p>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </BaseNode>
));

export const CleanNode = memo(({ data, selected }: any) => (
  <BaseNode icon={Sparkles} title="Clean Data" type="clean" selected={selected}>
    <div className="flex gap-1 flex-wrap">
      {data.config?.trim && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">Trim</span>}
      {data.config?.removeNulls && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">No nulls</span>}
    </div>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </BaseNode>
));

export const ExportNode = memo(({ data, selected }: any) => (
  <BaseNode icon={FileOutput} title="Export Output" type="export" selected={selected}>
    <p>Target: {data.config?.format || 'CSV'}</p>
    <Handle type="target" position={Position.Left} />
  </BaseNode>
));
