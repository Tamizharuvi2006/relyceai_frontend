import React from "react";

const KPICard = ({ title, value, icon: Icon, gradient, subtitle }) => (
    <div className={`rounded-xl p-3 md:p-5 ${gradient} shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5`}>
        <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs uppercase tracking-wider text-white/70 font-medium truncate">{title}</p>
                <p className="text-lg md:text-2xl font-bold text-white mt-0.5 md:mt-1">
                    {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
                </p>
                {subtitle && <p className="text-xs text-white/50 mt-1 hidden md:block">{subtitle}</p>}
            </div>
            {Icon && (
                <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0 ml-2">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
            )}
        </div>
    </div>
);

export default KPICard;
