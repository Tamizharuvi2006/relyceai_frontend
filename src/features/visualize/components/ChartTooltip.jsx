import React from "react";

/**
 * Enhanced tooltip for charts - shows all details on hover when enabled
 */
const ChartTooltip = ({
    label,
    value,
    color,
    tooltipKey,
    tooltipValue,
    allData,
    showAllOnHover
}) => {
    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return val;
    };

    return (
        <div className="bg-black/95 backdrop-blur-xl border border-zinc-700/50 p-3 rounded-xl shadow-2xl min-w-[180px] max-w-[300px]">
            {/* Header */}
            <p className="font-semibold text-emerald-400 border-b border-zinc-700/50 pb-2 mb-2 truncate">
                {label}
            </p>

            {/* Main Value (Y-Axis) */}
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-3 h-3 rounded-full shadow-lg flex-shrink-0"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
                />
                <span className="font-bold text-white text-lg">
                    {formatValue(value)}
                </span>
            </div>

            {/* 3rd Axis - Tooltip Detail (only when NOT showing all) */}
            {!showAllOnHover && tooltipKey && tooltipValue !== undefined && (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">{tooltipKey}</span>
                        <span className="text-sm text-emerald-300 font-medium">
                            {formatValue(tooltipValue)}
                        </span>
                    </div>
                </div>
            )}

            {/* Show All Details on Hover - Automatically shown when enabled */}
            {showAllOnHover && allData && (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wide mb-2">All Fields</p>
                    <div
                        className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#10b981 #27272a'
                        }}
                    >
                        {Object.entries(allData).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between gap-3 text-xs bg-zinc-900/50 px-2 py-1 rounded">
                                <span className="text-gray-500 truncate">{key}</span>
                                <span className="text-gray-200 font-medium truncate max-w-[120px]">
                                    {formatValue(val)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartTooltip;
