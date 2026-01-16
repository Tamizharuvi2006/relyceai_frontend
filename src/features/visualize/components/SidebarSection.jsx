import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const SidebarSection = ({ title, section, icon: Icon, expanded, onToggle, children }) => (
    <div className="border-b border-zinc-800">
        <button onClick={() => onToggle(section)}
            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-zinc-800/50 transition-colors">
            <Icon size={14} className="text-emerald-400" />
            <span className="text-sm font-medium text-gray-300 flex-1 text-left">{title}</span>
            {expanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 pb-4 space-y-3">{children}</div>
        </div>
    </div>
);

export default SidebarSection;
