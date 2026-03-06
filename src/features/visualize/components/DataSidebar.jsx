import React, { useState } from "react";
import { BarChart2, SortAsc, SortDesc, Filter, Sigma, Eye, EyeOff, RefreshCw, X, Info } from "lucide-react";
import SidebarSection from "./SidebarSection";

const AGGREGATION_INFO = {
    sum: { title: 'SUM', desc: 'Adds all values together for each category' },
    avg: { title: 'AVG', desc: 'Calculates the average (mean) value per category' },
    count: { title: 'COUNT', desc: 'Counts how many items exist in each category' },
    max: { title: 'MAX', desc: 'Shows the highest value in each category' },
    min: { title: 'MIN', desc: 'Shows the lowest value in each category' }
};

const DataSidebar = ({
    fileName,
    sidebarOpen,
    setSidebarOpen,
    xAxisKey,
    yAxisKey,
    setXAxisKey,
    setYAxisKey,
    tooltipKey,
    setTooltipKey,
    showAllOnHover,
    setShowAllOnHover,
    availableCols,
    aggregateMode,
    setAggregateMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterValue,
    setFilterValue,
    showTop,
    setShowTop,
    hiddenColumns,
    toggleColumn,
    expandedSections,
    toggleSection,
    processedDataLength,
    originalDataLength,
    resetAll
}) => {
    const [hoveredMode, setHoveredMode] = useState(null);

    if (!sidebarOpen) return null;

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
            />

            {/* Tooltip Overlay - Rendered outside sidebar */}
            {hoveredMode && (
                <div
                    className="hidden md:block fixed bg-[#0a0d14] border border-white/10 rounded-[2px] px-5 py-4 shadow-2xl"
                    style={{
                        zIndex: 999999,
                        left: '320px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '220px'
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Info size={16} className="text-emerald-400" />
                        <span className="font-light tracking-wide text-zinc-200 text-sm">{AGGREGATION_INFO[hoveredMode].title}</span>
                    </div>
                    <p className="text-zinc-500 text-xs font-light leading-relaxed">{AGGREGATION_INFO[hoveredMode].desc}</p>
                </div>
            )}

            <div className="fixed md:relative inset-y-0 left-0 w-[85%] max-w-xs md:w-72 lg:w-80 border-r border-white/5 flex flex-col bg-[#030508]/95 backdrop-blur-md z-50 md:z-auto">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-white/5 bg-transparent">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-light tracking-widest uppercase text-sm text-zinc-300">Data Explorer</h2>
                            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1 truncate max-w-[180px]">{fileName}</p>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="text-zinc-500 hover:text-white p-1 hover:bg-white/5 rounded-[2px] transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto smooth-scroll">
                    {/* Fields Section */}
                    <SidebarSection title="Data Fields" section="fields" icon={BarChart2}
                        expanded={expandedSections.fields} onToggle={toggleSection}>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">X-Axis (Category)</label>
                                <select value={xAxisKey} onChange={e => setXAxisKey(e.target.value)}
                                    className="w-full bg-[#0a0d14] border border-white/10 rounded-[2px] px-3 py-2 text-xs font-light tracking-wide text-zinc-300 outline-none focus:border-emerald-500/50 transition-colors">
                                    {availableCols.all.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">Y-Axis (Values)</label>
                                <select value={yAxisKey} onChange={e => setYAxisKey(e.target.value)}
                                    className="w-full bg-[#0a0d14] border border-white/10 rounded-[2px] px-3 py-2 text-xs font-light tracking-wide text-zinc-300 outline-none focus:border-emerald-500/50 transition-colors">
                                    {availableCols.all.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
                                    <span>Tooltip Detail</span>
                                    <span className="text-emerald-400 text-[10px]">(hover info)</span>
                                </label>
                                <select value={tooltipKey || ''} onChange={e => setTooltipKey(e.target.value || null)}
                                    className="w-full bg-[#0a0d14] border border-white/10 rounded-[2px] px-3 py-2 text-xs font-light tracking-wide text-zinc-300 outline-none focus:border-emerald-500/50 transition-colors">
                                    <option value="">None</option>
                                    {availableCols.all.filter(k => k !== xAxisKey && k !== yAxisKey).map(k => (
                                        <option key={k} value={k}>{k}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Show all details toggle */}
                            <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2">
                                <span className="text-xs text-gray-400">Show all on hover</span>
                                <button
                                    onClick={() => setShowAllOnHover(!showAllOnHover)}
                                    className={`w-10 h-5 rounded-full transition-colors ${showAllOnHover ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${showAllOnHover ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>
                    </SidebarSection>

                    {/* Aggregate Section */}
                    <SidebarSection title="Aggregation" section="aggregate" icon={Sigma}
                        expanded={expandedSections.aggregate} onToggle={toggleSection}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                <Info size={12} />
                                <span>Hover for info</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                {['sum', 'avg', 'count', 'max', 'min'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setAggregateMode(mode)}
                                        onMouseEnter={() => setHoveredMode(mode)}
                                        onMouseLeave={() => setHoveredMode(null)}
                                        className={`w-full py-2 rounded-[2px] text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${aggregateMode === mode ? 'bg-emerald-900/20 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)] text-emerald-400' : 'bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </SidebarSection>

                    {/* Sort Section */}
                    <SidebarSection title="Sort Data" section="sort" icon={SortAsc}
                        expanded={expandedSections.sort} onToggle={toggleSection}>
                        <div className="space-y-3">
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="w-full bg-[#0a0d14] border border-white/10 rounded-[2px] px-3 py-2 text-xs font-light tracking-wide text-zinc-300 outline-none focus:border-emerald-500/50 transition-colors">
                                <option value="">No sorting</option>
                                {availableCols.all.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <button onClick={() => setSortOrder("asc")}
                                    className={`flex-1 py-2 rounded-[2px] text-xs font-light tracking-wide flex flex-col items-center justify-center gap-1 transition-all duration-300 ${sortOrder === 'asc' ? 'bg-emerald-900/20 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)] text-emerald-400' : 'bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}>
                                    <span className="flex items-center gap-1"><SortAsc size={14} /> Ascending</span>
                                    <span className="text-[10px] opacity-70">1→9 / A→Z</span>
                                </button>
                                <button onClick={() => setSortOrder("desc")}
                                    className={`flex-1 py-2 rounded-[2px] text-xs font-light tracking-wide flex flex-col items-center justify-center gap-1 transition-all duration-300 ${sortOrder === 'desc' ? 'bg-emerald-900/20 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)] text-emerald-400' : 'bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}>
                                    <span className="flex items-center gap-1"><SortDesc size={14} /> Descending</span>
                                    <span className="text-[10px] opacity-70">9→1 / Z→A</span>
                                </button>
                            </div>
                        </div>
                    </SidebarSection>

                    {/* Filter Section */}
                    <SidebarSection title="Filter & Limit" section="filter" icon={Filter}
                        expanded={expandedSections.filter} onToggle={toggleSection}>
                        <div className="space-y-3">
                            <input type="text" value={filterValue} onChange={e => setFilterValue(e.target.value)}
                                placeholder={`Search in ${xAxisKey}...`}
                                className="w-full bg-[#0a0d14] border border-white/10 rounded-[2px] px-3 py-2 text-xs font-light tracking-wide text-zinc-300 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-colors" />
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Top N Records</p>
                                <div className="flex gap-1">
                                    {[0, 5, 10, 25, 50, 100].map(n => (
                                        <button key={n} onClick={() => setShowTop(n)}
                                            className={`flex-1 py-1.5 rounded-[2px] text-[10px] font-mono transition-all duration-300 ${showTop === n ? 'bg-emerald-900/20 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)] text-emerald-400' : 'bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}>
                                            {n === 0 ? 'All' : n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SidebarSection>

                    {/* Column Visibility */}
                    <div className="p-4 border-b border-zinc-800">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">Column Visibility</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto smooth-scroll">
                            {availableCols.all.map(col => (
                                <button key={col} onClick={() => toggleColumn(col)}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs ${hiddenColumns.includes(col) ? 'text-gray-500' : 'text-gray-300'} hover:bg-zinc-800`}>
                                    {hiddenColumns.includes(col) ? <EyeOff size={12} /> : <Eye size={12} className="text-emerald-400" />}
                                    <span className="truncate">{col}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#0a0d14] border border-white/5 rounded-[2px] p-2 text-center">
                            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Showing</p>
                            <p className="text-emerald-400 font-light text-xl mt-1">{processedDataLength}</p>
                        </div>
                        <div className="bg-[#0a0d14] border border-white/5 rounded-[2px] p-2 text-center">
                            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Total</p>
                            <p className="text-zinc-300 font-light text-xl mt-1">{originalDataLength || 0}</p>
                        </div>
                    </div>
                    <button onClick={resetAll}
                        className="w-full py-2.5 bg-transparent border border-white/5 hover:bg-white/[0.02] rounded-[2px] text-[10px] uppercase tracking-widest font-mono text-zinc-400 flex items-center justify-center gap-2 transition-colors">
                        <RefreshCw size={14} /> Reset All Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default DataSidebar;
