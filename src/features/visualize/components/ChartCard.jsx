import React, { useState, memo, useEffect, useMemo } from "react";
import { Maximize2, X, Info, ChevronRight, ChevronDown, User, List } from "lucide-react";
import NivoBarChart from "./NivoBarChart";
import NivoLineChart from "./NivoLineChart";
import NivoPieChart from "./NivoPieChart";

const ChartCard = memo(({ type, title, data, rawData, xAxisKey, yAxisKey, tooltipKey, showAllOnHover, aggregateMode, height = 300 }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showAllDetails, setShowAllDetails] = useState(false);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
                setDetailsPanelOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isFullscreen]);

    if (!data?.length || !xAxisKey || !yAxisKey) return null;

    // Use rawData for details panel (has ALL columns), fallback to data if rawData not available
    const detailsData = rawData && rawData.length > 0 ? rawData : data;

    const chartProps = {
        data,
        rawData,
        xAxisKey,
        yAxisKey,
        tooltipKey,
        showAllOnHover
    };

    const renderChart = () => {
        switch (type) {
            case "bar":
                return <NivoBarChart {...chartProps} />;
            case "line":
                return <NivoLineChart {...chartProps} />;
            case "area":
                return <NivoLineChart {...chartProps} enableArea={true} />;
            case "pie":
                return <NivoPieChart {...chartProps} />;
            default:
                return null;
        }
    };

    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        if (val === null || val === undefined) return '-';
        return String(val);
    };

    // Check if item should show details (either selected or showAllDetails is true)
    const shouldShowDetails = (index) => showAllDetails || selectedItem === index;

    return (
        <>
            {/* Regular Card */}
            <div className="group bg-[#0a0d14] backdrop-blur-sm rounded-[2px] border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300">
                <div className="px-3 md:px-5 py-3 md:py-4 border-b border-white/5 flex items-center justify-between bg-transparent">
                    <h3 className="font-light tracking-widest uppercase text-zinc-300 text-xs truncate pr-2">{title}</h3>
                    <div className="flex items-center gap-1 md:gap-3 shrink-0">
                        {tooltipKey && (
                            <span className="hidden md:flex text-[10px] font-mono uppercase tracking-widest text-emerald-400/60 items-center gap-1">
                                <Info size={10} />
                                {tooltipKey}
                            </span>
                        )}
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-900/20 px-2 py-0.5 rounded-[2px] border border-emerald-500/20">
                            {data.length}
                        </span>
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-[2px] transition-all duration-200 md:opacity-0 md:group-hover:opacity-100"
                            title="Enlarge chart"
                        >
                            <Maximize2 size={14} className="md:w-4 md:h-4" />
                        </button>
                    </div>
                </div>
                <div className="p-2 md:p-4" style={{ height }}>
                    {renderChart()}
                </div>
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-50 bg-[#030508]/98 backdrop-blur-xl flex animate-in fade-in duration-200"
                    onClick={() => { setIsFullscreen(false); setDetailsPanelOpen(false); }}
                >
                    {/* Main Chart Area */}
                    <div
                        className={`flex-1 flex flex-col transition-all duration-300 ${detailsPanelOpen ? 'mr-0 md:mr-80' : ''}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0d14] shrink-0">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base md:text-xl font-light tracking-widest uppercase text-white truncate">{title}</h2>
                                <div className="flex flex-wrap items-center gap-4 mt-2 font-mono text-[10px] tracking-widest uppercase">
                                    <p className="text-zinc-500">
                                        {data.length} points • {aggregateMode?.toUpperCase()}
                                    </p>
                                    <div className="hidden sm:flex items-center gap-2">
                                        <span className="text-zinc-600">X:</span>
                                        <span className="text-emerald-400">{xAxisKey}</span>
                                        <span className="text-zinc-600 ml-2">Y:</span>
                                        <span className="text-emerald-400">{yAxisKey}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {/* Details Panel Toggle - More Visible */}
                                <button
                                    onClick={() => setDetailsPanelOpen(!detailsPanelOpen)}
                                    className={`px-4 py-2 rounded-[2px] transition-all duration-300 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase border ${detailsPanelOpen ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-transparent border-white/10 text-zinc-500 hover:text-white hover:border-white/20'}`}
                                    title="Show data details"
                                >
                                    <List size={16} />
                                    <span className="hidden sm:inline">Details</span>
                                </button>
                                <span className="hidden md:inline font-mono text-[10px] tracking-widest uppercase text-zinc-600">ESC to close</span>
                                <button
                                    onClick={() => { setIsFullscreen(false); setDetailsPanelOpen(false); }}
                                    className="p-2 md:p-2.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-[2px] transition-colors"
                                >
                                    <X size={20} className="md:w-6 md:h-6" strokeWidth={1} />
                                </button>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="flex-1 p-3 md:p-6 min-h-0">
                            <div className="h-full w-full">
                                {renderChart()}
                            </div>
                        </div>
                    </div>

                    {/* Details Side Panel - Uses rawData to show ALL columns */}
                    <div
                        className={`fixed inset-y-0 right-0 w-full md:w-80 bg-[#0a0d14]/98 border-l border-white/5 flex flex-col transition-transform duration-300 z-10 ${detailsPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Panel Header */}
                        <div className="p-4 border-b border-white/5 bg-[#030508] shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-light tracking-widest uppercase text-sm text-zinc-300">Data Details</h3>
                                    <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mt-1">{detailsData.length} items • All cols</p>
                                </div>
                                <button
                                    onClick={() => setDetailsPanelOpen(false)}
                                    className="md:hidden p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-[2px]"
                                >
                                    <X size={18} strokeWidth={1} />
                                </button>
                            </div>
                            {/* Show All Toggle */}
                            <button
                                onClick={() => setShowAllDetails(!showAllDetails)}
                                className={`w-full py-2 px-3 rounded-[2px] text-[10px] font-mono tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 border ${showAllDetails ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-transparent border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                            >
                                {showAllDetails ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
                                {showAllDetails ? 'Collapse All' : 'Show All Details'}
                            </button>
                        </div>

                        {/* Data List with themed scrollbar - Uses detailsData (rawData) */}
                        <div
                            className="flex-1 overflow-y-auto"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#10b981 #18181b'
                            }}
                        >
                            {detailsData.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => !showAllDetails && setSelectedItem(selectedItem === index ? null : index)}
                                    className={`border-b border-white/5 transition-colors ${!showAllDetails ? 'cursor-pointer' : ''} ${shouldShowDetails(index) ? 'bg-emerald-900/10' : 'hover:bg-white/[0.02]'}`}
                                >
                                    {/* Item Summary */}
                                    <div className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-[2px] bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                            <User size={14} className="text-emerald-500" strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {String(item[xAxisKey])}
                                            </p>
                                            <p className="text-xs text-emerald-400">
                                                {yAxisKey}: {formatValue(item[yAxisKey])}
                                            </p>
                                        </div>
                                        {!showAllDetails && (
                                            <ChevronRight size={16} className={`text-gray-500 transition-transform ${selectedItem === index ? 'rotate-90' : ''}`} />
                                        )}
                                    </div>

                                    {/* Expanded Details - Shows ALL columns from rawData */}
                                    {shouldShowDetails(index) && (
                                        <div className="px-3 pb-3 space-y-1.5 bg-[#030508]/50 pt-2 border-t border-white/5 mt-2">
                                            {Object.entries(item).map(([key, val]) => (
                                                <div key={key} className="flex items-center justify-between text-[10px] font-mono tracking-wider py-1.5 px-2 bg-[#0a0d14]/50 border border-white/5 rounded-[2px]">
                                                    <span className="text-zinc-500 shrink-0 uppercase">{key}</span>
                                                    <span className="text-zinc-300 truncate max-w-[150px] ml-2">
                                                        {formatValue(val)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

ChartCard.displayName = 'ChartCard';
export default ChartCard;
