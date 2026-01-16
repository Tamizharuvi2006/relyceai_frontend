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
            <div className="group bg-zinc-900/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-zinc-800/80 overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10">
                <div className="px-3 md:px-5 py-3 md:py-4 border-b border-zinc-800/60 flex items-center justify-between bg-gradient-to-r from-zinc-900/50 to-transparent">
                    <h3 className="font-semibold text-gray-200 text-sm md:text-base truncate pr-2">{title}</h3>
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        {tooltipKey && (
                            <span className="hidden md:flex text-[10px] text-emerald-400/60 items-center gap-1">
                                <Info size={10} />
                                {tooltipKey}
                            </span>
                        )}
                        <span className="text-[10px] md:text-xs text-emerald-400/80 bg-emerald-500/10 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium">
                            {data.length}
                        </span>
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="p-1 md:p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-zinc-800/80 rounded-lg transition-all duration-200 md:opacity-0 md:group-hover:opacity-100"
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
                    className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl flex animate-in fade-in duration-200"
                    onClick={() => { setIsFullscreen(false); setDetailsPanelOpen(false); }}
                >
                    {/* Main Chart Area */}
                    <div
                        className={`flex-1 flex flex-col transition-all duration-300 ${detailsPanelOpen ? 'mr-0 md:mr-80' : ''}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-zinc-800/60 flex items-center justify-between bg-gradient-to-r from-zinc-950 to-zinc-900 shrink-0">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base md:text-xl font-bold text-white truncate">{title}</h2>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1">
                                    <p className="text-xs md:text-sm text-gray-500">
                                        {data.length} points • {aggregateMode?.toUpperCase()}
                                    </p>
                                    <div className="hidden sm:flex items-center gap-2 text-xs">
                                        <span className="text-gray-600">X:</span>
                                        <span className="text-emerald-400">{xAxisKey}</span>
                                        <span className="text-gray-600 ml-2">Y:</span>
                                        <span className="text-emerald-400">{yAxisKey}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {/* Details Panel Toggle - More Visible */}
                                <button
                                    onClick={() => setDetailsPanelOpen(!detailsPanelOpen)}
                                    className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium ${detailsPanelOpen ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-600/50'}`}
                                    title="Show data details"
                                >
                                    <List size={16} />
                                    <span className="hidden sm:inline">Details</span>
                                </button>
                                <span className="hidden md:inline text-xs text-gray-500">ESC to close</span>
                                <button
                                    onClick={() => { setIsFullscreen(false); setDetailsPanelOpen(false); }}
                                    className="p-2 md:p-2.5 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    <X size={20} className="md:w-6 md:h-6" />
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
                        className={`fixed inset-y-0 right-0 w-full md:w-80 bg-zinc-900/98 border-l border-zinc-700/50 flex flex-col transition-transform duration-300 z-10 ${detailsPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Panel Header */}
                        <div className="p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-white">Data Details</h3>
                                    <p className="text-xs text-gray-500">{detailsData.length} items • All columns</p>
                                </div>
                                <button
                                    onClick={() => setDetailsPanelOpen(false)}
                                    className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            {/* Show All Toggle */}
                            <button
                                onClick={() => setShowAllDetails(!showAllDetails)}
                                className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${showAllDetails ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white'}`}
                            >
                                {showAllDetails ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                                    className={`border-b border-zinc-800/50 transition-colors ${!showAllDetails ? 'cursor-pointer' : ''} ${shouldShowDetails(index) ? 'bg-emerald-600/10' : 'hover:bg-zinc-800/50'}`}
                                >
                                    {/* Item Summary */}
                                    <div className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
                                            <User size={14} className="text-white" />
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
                                        <div className="px-3 pb-3 space-y-1.5 bg-zinc-950/50">
                                            {Object.entries(item).map(([key, val]) => (
                                                <div key={key} className="flex items-center justify-between text-xs py-1.5 px-2 bg-zinc-900/50 rounded">
                                                    <span className="text-gray-500 shrink-0">{key}</span>
                                                    <span className="text-gray-200 font-medium truncate max-w-[150px] ml-2">
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
