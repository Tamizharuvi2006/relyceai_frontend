import React, { useState, useRef, useMemo, useEffect, useCallback, memo } from "react";
import {
    FileSpreadsheet, Download, Filter, Maximize2, Minimize2,
    Sigma, Percent, ArrowUpRight, ArrowDownRight, Hash, Trash2
} from "lucide-react";
import * as XLSX from "xlsx";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";

import ChartCard from "../components/ChartCard";
import KPICard from "../components/KPICard";
import DataSidebar from "../components/DataSidebar";
import UploadDisclaimer from "../components/UploadDisclaimer";
import { exportDashboardAsPDF } from "../components/ExportPDF";

ModuleRegistry.registerModules([AllCommunityModule]);

const VisualizeData = memo(({ isEmbedded = false }) => {
    // Data State
    const [data, setData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [columns, setColumns] = useState([]);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // View State
    const [activeTab, setActiveTab] = useState("dashboard");
    const [fullscreen, setFullscreen] = useState(false);

    // Data Configuration
    const [xAxisKey, setXAxisKey] = useState("");
    const [yAxisKey, setYAxisKey] = useState("");
    const [tooltipKey, setTooltipKey] = useState(null);
    const [showAllOnHover, setShowAllOnHover] = useState(false);
    const [availableCols, setAvailableCols] = useState({ numeric: [], categorical: [], all: [] });

    // Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [filterValue, setFilterValue] = useState("");
    const [showTop, setShowTop] = useState(0);
    const [expandedSections, setExpandedSections] = useState({ fields: true, sort: true, filter: true, aggregate: false });
    const [aggregateMode, setAggregateMode] = useState("sum");
    const [hiddenColumns, setHiddenColumns] = useState([]);

    // Refs
    const chartRef = useRef(null);
    const fileRef = useRef(null);

    // Load data from sessionStorage on mount (avoid localStorage to honor isolation rule)
    useEffect(() => {
        const savedData = sessionStorage.getItem('visualize_data');
        const savedFileName = sessionStorage.getItem('visualize_fileName');
        const savedColumns = sessionStorage.getItem('visualize_columns');
        const savedCols = sessionStorage.getItem('visualize_availableCols');
        const savedXAxis = sessionStorage.getItem('visualize_xAxisKey');
        const savedYAxis = sessionStorage.getItem('visualize_yAxisKey');

        if (savedData && savedFileName) {
            try {
                const parsedData = JSON.parse(savedData);
                setData(parsedData);
                setOriginalData(parsedData);
                setFileName(savedFileName);
                if (savedColumns) setColumns(JSON.parse(savedColumns));
                if (savedCols) setAvailableCols(JSON.parse(savedCols));
                if (savedXAxis) setXAxisKey(savedXAxis);
                if (savedYAxis) setYAxisKey(savedYAxis);
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }, []);

    // Save data to sessionStorage when it changes
    useEffect(() => {
        if (data && fileName) {
            sessionStorage.setItem('visualize_data', JSON.stringify(data));
            sessionStorage.setItem('visualize_fileName', fileName);
            sessionStorage.setItem('visualize_columns', JSON.stringify(columns));
            sessionStorage.setItem('visualize_availableCols', JSON.stringify(availableCols));
            sessionStorage.setItem('visualize_xAxisKey', xAxisKey);
            sessionStorage.setItem('visualize_yAxisKey', yAxisKey);
        }
    }, [data, fileName, columns, availableCols, xAxisKey, yAxisKey]);

    // Processed Data - Memoized
    const processedData = useMemo(() => {
        if (!data) return [];
        let result = [...data];

        if (filterValue && xAxisKey) {
            const lowerFilter = filterValue.toLowerCase();
            result = result.filter(row =>
                String(row[xAxisKey]).toLowerCase().includes(lowerFilter)
            );
        }

        if (sortBy) {
            result.sort((a, b) => {
                const aVal = parseFloat(a[sortBy]) || a[sortBy];
                const bVal = parseFloat(b[sortBy]) || b[sortBy];
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }
                return sortOrder === 'asc'
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal));
            });
        }

        if (showTop > 0) result = result.slice(0, showTop);
        return result;
    }, [data, sortBy, sortOrder, filterValue, showTop, xAxisKey]);

    // Aggregated Data - Memoized
    const aggregatedData = useMemo(() => {
        if (!processedData.length || !xAxisKey || !yAxisKey) return processedData;

        const groups = {};
        processedData.forEach(row => {
            const key = row[xAxisKey] || 'Unknown';
            if (!groups[key]) groups[key] = { values: [], count: 0 };
            const val = parseFloat(row[yAxisKey]) || 0;
            groups[key].values.push(val);
            groups[key].count++;
        });

        return Object.entries(groups).map(([name, groupData]) => {
            const sum = groupData.values.reduce((a, b) => a + b, 0);
            let value;
            switch (aggregateMode) {
                case 'avg': value = sum / groupData.count; break;
                case 'count': value = groupData.count; break;
                case 'max': value = Math.max(...groupData.values); break;
                case 'min': value = Math.min(...groupData.values); break;
                default: value = sum;
            }
            return { [xAxisKey]: name, [yAxisKey]: value };
        });
    }, [processedData, xAxisKey, yAxisKey, aggregateMode]);

    // KPI Data - Memoized
    const kpiData = useMemo(() => {
        if (!processedData.length || !yAxisKey) return null;
        const values = processedData.map(d => parseFloat(d[yAxisKey]) || 0);
        const sum = values.reduce((a, b) => a + b, 0);
        const uniqueItems = [...new Set(processedData.map(d => d[xAxisKey]))];
        const sampleNames = uniqueItems.slice(0, 3).map(n => String(n).slice(0, 10)).join(', ');
        return {
            sum,
            avg: sum / values.length,
            max: Math.max(...values),
            min: Math.min(...values),
            count: processedData.length,
            uniqueX: uniqueItems.length,
            uniqueSample: sampleNames + (uniqueItems.length > 3 ? '...' : '')
        };
    }, [processedData, yAxisKey, xAxisKey]);

    // Analyze Columns - Memoized callback
    const analyzeColumns = useCallback((json) => {
        if (!json?.length) return;
        const keys = Object.keys(json[0]);
        const numeric = keys.filter(k =>
            json.some(r => typeof r[k] === 'number' || (!isNaN(parseFloat(r[k])) && isFinite(parseFloat(r[k]))))
        );
        const categorical = keys.filter(k => !numeric.includes(k));

        setXAxisKey(categorical[0] || keys[0]);
        setYAxisKey(numeric[0] || keys[1] || keys[0]);
        setSortBy(numeric[0] || "");
        setAvailableCols({ numeric, categorical, all: keys });
        setHiddenColumns([]);
    }, []);

    // Process File
    const processFile = useCallback((file) => {
        if (!file) return;
        setIsLoading(true);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target.result;
                const workbook = XLSX.read(result, { type: "binary" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                let json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                // Smart header detection
                if (json.length > 0 && Object.keys(json[0]).some(k => k.startsWith('__EMPTY'))) {
                    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
                    for (let i = 0; i < Math.min(15, rawData.length); i++) {
                        const row = rawData[i];
                        if (!row?.length) continue;
                        const nonEmpty = row.filter(c => c !== "" && c != null);
                        if (nonEmpty.length >= 2) {
                            const testJson = XLSX.utils.sheet_to_json(sheet, { defval: "", range: i });
                            if (testJson.length > 0 && !Object.keys(testJson[0]).every(k => k.startsWith('__EMPTY'))) {
                                json = testJson;
                                break;
                            }
                        }
                    }
                }

                // Clean empty columns
                const finalData = json.map(row => {
                    const clean = {};
                    Object.entries(row).forEach(([k, v]) => {
                        if (!k.startsWith('__EMPTY') && k.trim()) clean[k] = v;
                    });
                    return clean;
                }).filter(row => Object.keys(row).length > 0);

                const dataToUse = finalData.length > 0 ? finalData : json;

                if (dataToUse.length > 0) {
                    setOriginalData(dataToUse);
                    setData(dataToUse);
                    setColumns(Object.keys(dataToUse[0]).map(k => ({
                        field: k, headerName: k, filter: true, sortable: true, resizable: true
                    })));
                    analyzeColumns(dataToUse);
                    setFilterValue("");
                    setShowTop(0);
                } else {
                    alert("Could not parse any data from this file.");
                }
            } catch (err) {
                console.error("Parse error:", err);
                alert("Error parsing file: " + err.message);
            } finally {
                setIsLoading(false);
                if (fileRef.current) fileRef.current.value = "";
            }
        };
        reader.onerror = () => {
            setIsLoading(false);
            alert("Error reading file");
        };
        reader.readAsBinaryString(file);
    }, [analyzeColumns]);

    // Toggle Section
    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    // Toggle Column
    const toggleColumn = useCallback((col) => {
        setHiddenColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    }, []);

    // Reset All
    const resetAll = useCallback(() => {
        if (originalData) {
            setData(originalData);
            analyzeColumns(originalData);
            setFilterValue("");
            setShowTop(0);
            setSortBy("");
            setAggregateMode("sum");
        }
    }, [originalData, analyzeColumns]);

    // Clear Data
    const clearData = useCallback(() => {
        sessionStorage.removeItem('visualize_data');
        sessionStorage.removeItem('visualize_fileName');
        sessionStorage.removeItem('visualize_columns');
        sessionStorage.removeItem('visualize_availableCols');
        sessionStorage.removeItem('visualize_xAxisKey');
        sessionStorage.removeItem('visualize_yAxisKey');

        setData(null);
        setOriginalData(null);
        setColumns([]);
        setFileName(null);
        setXAxisKey("");
        setYAxisKey("");
        setAvailableCols({ numeric: [], categorical: [], all: [] });
        setSortBy("");
        setFilterValue("");
        setShowTop(0);
        setHiddenColumns([]);
        setAggregateMode("sum");
        setActiveTab("dashboard");
    }, []);

    // Export Dashboard as PDF
    const exportDashboard = useCallback(() => exportDashboardAsPDF(chartRef, fileName), [fileName]);

    // Visible Columns - Memoized
    const visibleColumns = useMemo(() =>
        columns.filter(c => !hiddenColumns.includes(c.field)),
        [columns, hiddenColumns]
    );

    // --- RENDER ---
    return (
        <div className={`flex ${isEmbedded ? 'h-full' : 'h-screen'} bg-[#030508] text-white font-sans ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Sidebar */}
            {data && (
                <DataSidebar
                    fileName={fileName}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    xAxisKey={xAxisKey}
                    yAxisKey={yAxisKey}
                    setXAxisKey={setXAxisKey}
                    setYAxisKey={setYAxisKey}
                    tooltipKey={tooltipKey}
                    setTooltipKey={setTooltipKey}
                    showAllOnHover={showAllOnHover}
                    setShowAllOnHover={setShowAllOnHover}
                    availableCols={availableCols}
                    aggregateMode={aggregateMode}
                    setAggregateMode={setAggregateMode}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    filterValue={filterValue}
                    setFilterValue={setFilterValue}
                    showTop={showTop}
                    setShowTop={setShowTop}
                    hiddenColumns={hiddenColumns}
                    toggleColumn={toggleColumn}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    processedDataLength={processedData.length}
                    originalDataLength={originalData?.length}
                    resetAll={resetAll}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                {data && (
                    <div className="h-14 bg-[#030508]/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-3 md:px-6">
                        <div className="flex items-center gap-2 md:gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="p-2 text-zinc-500 hover:text-white hover:bg-white/[0.02] rounded-[2px] transition-colors">
                                <Filter size={18} />
                            </button>
                            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-transparent rounded-none border border-white/5">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-zinc-300 truncate max-w-[120px] md:max-w-[180px] font-light tracking-wide">{fileName}</span>
                                <span className="text-xs text-zinc-500 font-mono">• {processedData.length}</span>
                            </div>
                            {/* Mobile file badge */}
                            <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 bg-transparent rounded-none border border-white/5">
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs text-zinc-400 font-mono">{processedData.length}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 md:gap-2">
                            <div className="flex bg-black/40 rounded-[2px] p-0.5 md:p-1 border border-white/5">
                                <button
                                    onClick={() => setActiveTab("dashboard")}
                                    className={`px-2 md:px-4 py-1.5 md:py-2 rounded-[2px] text-[10px] md:text-xs font-mono uppercase tracking-widest transition-all duration-300 ${activeTab === 'dashboard'
                                        ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <span className="hidden sm:inline">Dashboard</span>
                                    <span className="sm:hidden">📊</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("table")}
                                    className={`px-2 md:px-4 py-1.5 md:py-2 rounded-[2px] text-[10px] md:text-xs font-mono uppercase tracking-widest transition-all duration-300 ${activeTab === 'table'
                                        ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <span className="hidden sm:inline">Data Grid</span>
                                    <span className="sm:hidden">📋</span>
                                </button>
                            </div>
                            <button
                                onClick={() => setFullscreen(!fullscreen)}
                                className="hidden md:block p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-[2px] border border-transparent hover:border-white/10 transition-colors"
                                title="Fullscreen"
                            >
                                {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button
                                onClick={exportDashboard}
                                className="hidden md:block p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-[2px] border border-transparent hover:border-white/10 transition-colors"
                                title="Export PDF"
                            >
                                <Download size={18} />
                            </button>
                            <button
                                onClick={clearData}
                                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-[2px] border border-transparent hover:border-red-500/20 transition-colors"
                                title="Clear Data"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto smooth-scroll bg-[#030508] relative">
                    <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                    {!data ? (
                        <div className="relative z-10 w-full h-full">
                            <UploadDisclaimer
                                onAccept={processFile}
                                isLoading={isLoading}
                                fileRef={fileRef}
                            />
                        </div>
                    ) : activeTab === 'table' ? (
                        <div className="h-full p-4 relative z-10">
                            <div className="h-full bg-[#0a0d14] rounded-[2px] border border-white/5 overflow-hidden">
                                <AgGridReact
                                    rowData={processedData}
                                    columnDefs={visibleColumns}
                                    pagination={true}
                                    paginationPageSize={50}
                                    theme={themeQuartz.withPart({ colorSchemeDark: 'dark' })}
                                    defaultColDef={{ flex: 1, minWidth: 100, filter: true, sortable: true, resizable: true }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div ref={chartRef} className="space-y-4 md:space-y-6 max-w-7xl mx-auto p-3 md:p-6 relative z-10">
                            {/* KPI Cards */}
                            {kpiData && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
                                    <KPICard title="Records" value={kpiData.count} icon={FileSpreadsheet} gradient="bg-gradient-to-br from-emerald-600 to-emerald-800" />
                                    <KPICard title="Sum" value={kpiData.sum} icon={Sigma} gradient="bg-gradient-to-br from-blue-600 to-blue-800" />
                                    <KPICard title="Avg" value={kpiData.avg} icon={Percent} gradient="bg-gradient-to-br from-purple-600 to-purple-800" />
                                    <KPICard title="Max" value={kpiData.max} icon={ArrowUpRight} gradient="bg-gradient-to-br from-orange-600 to-orange-800" />
                                    <KPICard title="Min" value={kpiData.min} icon={ArrowDownRight} gradient="bg-gradient-to-br from-red-600 to-red-800" />
                                    <KPICard title="Unique" value={kpiData.uniqueX} icon={Hash} gradient="bg-gradient-to-br from-pink-600 to-pink-800" />
                                </div>
                            )}

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                <ChartCard type="bar" title={`${yAxisKey} by ${xAxisKey}`} data={aggregatedData} rawData={processedData} xAxisKey={xAxisKey} yAxisKey={yAxisKey} tooltipKey={tooltipKey} showAllOnHover={showAllOnHover} aggregateMode={aggregateMode} height={250} />
                                <ChartCard type="line" title={`${yAxisKey} Trend`} data={aggregatedData} rawData={processedData} xAxisKey={xAxisKey} yAxisKey={yAxisKey} tooltipKey={tooltipKey} showAllOnHover={showAllOnHover} aggregateMode={aggregateMode} height={250} />
                                <ChartCard type="area" title={`${yAxisKey} Distribution`} data={aggregatedData} rawData={processedData} xAxisKey={xAxisKey} yAxisKey={yAxisKey} tooltipKey={tooltipKey} showAllOnHover={showAllOnHover} aggregateMode={aggregateMode} height={250} />
                                <ChartCard type="pie" title={`${xAxisKey} Breakdown`} data={aggregatedData} rawData={processedData} xAxisKey={xAxisKey} yAxisKey={yAxisKey} tooltipKey={tooltipKey} showAllOnHover={showAllOnHover} aggregateMode={aggregateMode} height={250} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

VisualizeData.displayName = 'VisualizeData';
export default VisualizeData;
