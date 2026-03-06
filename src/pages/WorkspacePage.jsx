import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Activity, Database } from "lucide-react";
import { Helmet } from "react-helmet-async";

import NivoVisualizeData from "../features/visualize/pages/NivoVisualizeData";
import UserFilesPage from "../features/files/pages/UserFilesPage";

export default function WorkspacePage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Parse query params to set active tab
    const searchParams = new URLSearchParams(location.search);
    const initialTab = searchParams.get("tab") === "files" ? "files" : "visualize";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab === "files" ? "files" : "visualize");
        }
    }, [location.search]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/workspace?tab=${tab}`, { replace: true });
    };

    return (
        <div className="min-h-screen w-full bg-[#030508] text-white pt-24 pb-12 font-sans flex flex-col relative overflow-hidden">
            <Helmet><title>Private Workspace | Relyce AI</title></Helmet>

            {/* Ambient Base Layer */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E')] mix-blend-overlay" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 w-full flex flex-col flex-1 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-white/5 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 border border-emerald-500/20 bg-emerald-500/10 rounded-[2px]">
                                <Shield className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-emerald-500">Secure Environment</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-white mb-2">
                            Private <span className="text-zinc-500">Workspace</span>
                        </h1>
                        <p className="text-sm font-light text-zinc-500 max-w-xl">
                            A secure, isolated zone for visual analysis and RAG document management. 
                            100% client-side privacy where applicable. Zero data leakage.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 bg-[#0a0d14]/80 p-1 border border-white/5 rounded-[2px] self-start md:self-auto backdrop-blur-md">
                        <button
                            onClick={() => handleTabChange("visualize")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-[2px] text-[10px] md:text-[11px] font-mono tracking-widest uppercase transition-all duration-300 ${
                                activeTab === "visualize" 
                                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10" 
                                : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-white/[0.02]"
                            }`}
                        >
                            <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>Visualize</span>
                        </button>
                        <button
                            onClick={() => handleTabChange("files")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-[2px] text-[10px] md:text-[11px] font-mono tracking-widest uppercase transition-all duration-300 ${
                                activeTab === "files" 
                                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10" 
                                : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-white/[0.02]"
                            }`}
                        >
                            <Database className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span className="whitespace-nowrap">Library (RAG)</span>
                        </button>
                    </div>
                </div>

                {/* Content Container */}
                <div className="flex-1 bg-[#0a0d14]/30 border border-white/5 rounded-[2px] overflow-hidden flex flex-col backdrop-blur-sm">
                    {activeTab === "visualize" ? (
                        <div className="flex-1 w-full min-h-[600px] h-[calc(100vh-280px)]">
                            <NivoVisualizeData isEmbedded={true} />
                        </div>
                    ) : (
                        <div className="flex-1 w-full h-[calc(100vh-280px)] overflow-y-auto">
                            <UserFilesPage isEmbedded={true} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
