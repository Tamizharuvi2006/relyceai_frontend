import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const SidebarSection = ({ title, section, icon: Icon, expanded, onToggle, children }) => (
    <div className="border-b border-white/5">
        <button onClick={() => onToggle(section)}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
            <Icon size={14} className="text-zinc-500" strokeWidth={1.5} />
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 flex-1 text-left">{title}</span>
            {expanded ? <ChevronDown size={14} className="text-zinc-500" strokeWidth={1} /> : <ChevronRight size={14} className="text-zinc-500" strokeWidth={1} />}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 pb-4 space-y-3 pt-2">{children}</div>
        </div>
    </div>
);

export default SidebarSection;
