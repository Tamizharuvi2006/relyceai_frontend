import React from "react";
import { Upload, Cpu, Database, Lock } from "lucide-react";

const UploadDisclaimer = ({ onAccept, isLoading, fileRef }) => {
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            onAccept(e.target.files[0]);
        }
    };

    return (
        <div className="w-full h-full min-h-[600px] flex pb-20 items-center justify-center relative overflow-hidden bg-[#030508]">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Thin grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                {/* Abstract light streaks */}
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1 bg-emerald-500/10 blur-3xl rotate-12 transform" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1 bg-emerald-500/10 blur-3xl -rotate-12 transform" />
            </div>

            <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-24">
                
                {/* Left Side: Typography & Action */}
                <div className="flex-1 flex flex-col items-start text-left">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                        <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-emerald-500/80">System Awaiting Upload</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-white mb-6 leading-[1.1]">
                        Transform Raw Data into <br className="hidden md:block"/>
                        <span className="text-zinc-500">Visual Insights.</span>
                    </h2>
                    
                    <p className="text-sm text-zinc-500 font-light max-w-md leading-relaxed mb-12">
                        Instantly map CSV or Excel datasets into interactive visualizations. 
                        No servers. No data retention. 100% in-browser processing.
                    </p>

                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={isLoading}
                        className="group relative px-8 py-4 bg-transparent border border-white/10 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        <div className="relative flex items-center gap-4">
                            <Upload className="w-4 h-4 text-emerald-500 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.5} />
                            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-300 group-hover:text-white transition-colors">
                                {isLoading ? 'Processing...' : 'Select Target File'}
                            </span>
                        </div>
                        {/* Scanning Line */}
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-emerald-500/0 group-hover:bg-emerald-500/50 transition-colors duration-500" />
                    </button>
                    <p className="text-[10px] font-mono text-zinc-600 mt-4 tracking-widest uppercase">Formats: .csv, .xlsx, .xls</p>
                </div>

                {/* Right Side: Abstract Data Points */}
                <div className="w-full md:w-80 flex flex-col gap-4 mt-8 md:mt-0">
                    {[
                        { icon: Database, label: "Client-Side Processing", desc: "Zero server footprint. Data processed locally." },
                        { icon: Lock, label: "Absolute Privacy", desc: "Files never leave your device memory." },
                        { icon: Cpu, label: "High-Fidelity Parsing", desc: "~98% extraction accuracy on complex Excel." }
                    ].map((item, idx) => (
                        <div key={idx} className="relative p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] backdrop-blur-sm transition-all duration-500 group">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="flex items-start gap-4">
                                <item.icon className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors mt-0.5" strokeWidth={1} />
                                <div>
                                    <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-300 mb-2">{item.label}</h4>
                                    <p className="text-xs text-zinc-600 font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <input
                    type="file"
                    ref={fileRef}
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

export default UploadDisclaimer;
