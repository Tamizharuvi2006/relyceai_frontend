import React from "react";

const KPICard = ({ title, value, icon: Icon, subtitle }) => (
    <div className={`rounded-[2px] p-3 md:p-5 bg-transparent border border-white/5 hover:border-white/20 transition-all duration-300 group`}>
        <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 truncate">{title}</p>
                <p className="text-xl md:text-3xl font-light text-zinc-200 mt-2">
                    {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
                </p>
                {subtitle && <p className="text-[10px] font-mono uppercase text-zinc-600 mt-2 hidden md:block tracking-widest">{subtitle}</p>}
            </div>
            {Icon && (
                <div className="p-2 bg-emerald-900/10 border border-emerald-500/20 rounded-[2px] shrink-0 ml-4 transition-colors group-hover:bg-emerald-900/20">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" strokeWidth={1} />
                </div>
            )}
        </div>
    </div>
);

export default KPICard;
