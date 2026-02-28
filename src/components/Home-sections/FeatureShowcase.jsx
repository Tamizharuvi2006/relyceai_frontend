import React, { useState, useEffect } from 'react';
import InteractiveCanvas from './InteractiveCanvas';
const FeatureShowcase = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 'personalization',
            title: "Web AI Personalization",
            subtitle: "Custom AI Personas",
            description: "Tailor your AI experience with specific personalities. From coding experts to creative writers, choose the persona that fits your precise needs for optimal output.",
            visualConfig: {
                coreScale: 'scale-100',
                coreGlow: 'bg-emerald-500/30 blur-[80px]',
                ring1Style: 'rounded-full border-[2px] border-white/5 rotate-45',
                ring2Style: 'rounded-full border border-dashed border-emerald-500/20 -rotate-12',
                ring3Style: 'rounded-full border-[1px] border-emerald-500/40 bg-white/5 scale-90'
            }
        },
        {
            id: 'business',
            title: "Business Chat",
            subtitle: "Enterprise Intelligence",
            description: "Secure, context-aware chat designed strictly for business operations. Streamline your company workflows and access private organizational knowledge instantly.",
            visualConfig: {
                coreScale: 'scale-75',
                coreGlow: 'bg-emerald-600/20 blur-[100px]',
                ring1Style: 'rounded-[100px] border-[2px] border-white/10 rotate-90',
                ring2Style: 'rounded-[100px] border border-dashed border-emerald-500/30 rotate-45',
                ring3Style: 'rounded-[100px] border-[1px] border-emerald-500/20 bg-emerald-500/5 scale-110'
            }
        },
        {
            id: 'coding',
            title: "Code Generation",
            subtitle: "Architectural Assistance",
            description: "Accelerate your development with intelligent code completion, complex refactoring, and instant debugging. The engine understands massive codebases with zero latency.",
            visualConfig: {
                coreScale: 'scale-125',
                coreGlow: 'bg-emerald-400/40 blur-[120px]',
                ring1Style: 'rounded-[40px] border-[2px] border-white/5 -rotate-45',
                ring2Style: 'rounded-[40px] border border-dashed border-emerald-500/40 rotate-180',
                ring3Style: 'rounded-[40px] border-[1px] border-emerald-500/60 bg-transparent scale-75'
            }
        },
        {
            id: 'generic',
            title: "Universal Chat",
            subtitle: "The Everyday Assistant",
            description: "Your frictionless interface for general inquiries, drafting, and complex problem-solving. Unbelievably fast, capable, and always ready to assist.",
            visualConfig: {
                coreScale: 'scale-110',
                coreGlow: 'bg-emerald-500/20 blur-[60px]',
                ring1Style: 'rounded-full border-[2px] border-white/10 rotate-12',
                ring2Style: 'rounded-full border border-dashed border-emerald-400/20 -rotate-90',
                ring3Style: 'rounded-full border-[1px] border-emerald-500/30 bg-white/[0.02] scale-105'
            }
        },
        {
            id: 'engine',
            title: "Core Intelligence",
            subtitle: "Advanced Nuance",
            description: "A centralized, ultra-fast cognitive engine that remembers context across sessions. It learns from your interactions to provide increasingly accurate and tailored responses.",
            visualConfig: {
                coreScale: 'scale-90',
                coreGlow: 'bg-emerald-700/40 blur-[90px]',
                ring1Style: 'rounded-[20px] border-[2px] border-emerald-500/10 rotate-180',
                ring2Style: 'rounded-[20px] border border-dashed border-white/10 rotate-90',
                ring3Style: 'rounded-[20px] border-[1px] border-emerald-500/50 bg-emerald-500/10 scale-125'
            }
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

        // Helper to convert glow class to RGBA for canvas
        const getGlowColor = (glowClass) => {
            if (glowClass.includes('emerald-400')) return 'rgba(52, 211, 153, 0.4)';
            if (glowClass.includes('emerald-500')) return 'rgba(16, 185, 129, 0.4)';
            if (glowClass.includes('emerald-600')) return 'rgba(5, 150, 105, 0.4)';
            if (glowClass.includes('emerald-700')) return 'rgba(4, 120, 87, 0.4)';
            return 'rgba(16, 185, 129, 0.4)';
        };

        const getLineColor = (glowClass) => {
            if (glowClass.includes('emerald-400')) return 'rgba(52, 211, 153, 0.2)';
            if (glowClass.includes('emerald-500')) return 'rgba(16, 185, 129, 0.2)';
            if (glowClass.includes('emerald-600')) return 'rgba(5, 150, 105, 0.2)';
            if (glowClass.includes('emerald-700')) return 'rgba(4, 120, 87, 0.2)';
            return 'rgba(16, 185, 129, 0.2)';
        }

        const getParticleColor = (glowClass) => {
             if (glowClass.includes('emerald-400')) return 'rgba(52, 211, 153, 0.8)';
             if (glowClass.includes('emerald-500')) return 'rgba(16, 185, 129, 0.8)';
             if (glowClass.includes('emerald-600')) return 'rgba(5, 150, 105, 0.8)';
             if (glowClass.includes('emerald-700')) return 'rgba(4, 120, 87, 0.8)';
             return 'rgba(16, 185, 129, 0.8)';
        }

    const currentData = slides[currentSlide];

    return (
        <section className="relative w-full py-40 bg-[#070a10] overflow-hidden">
            
            {/* Massive Background Typography Watermark */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 opacity-[0.015] pointer-events-none whitespace-nowrap">
                <h1 className="text-[300px] font-bold text-white tracking-tighter mix-blend-overlay">
                    CAPABILITIES
                </h1>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                
                {/* Minimalist Editorial Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32 border-b border-white/[0.03] pb-16">
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-px bg-emerald-500/50" />
                            <h2 
                                className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/70 font-medium"
                                style={{ fontFamily: "'Geist Mono', monospace" }}
                            >
                                The Ecosystem
                            </h2>
                        </div>
                        <h3 className="text-5xl md:text-7xl font-medium tracking-tighter text-zinc-100 leading-[1.05]">
                            Everything you need. <br/>
                            <span className="text-zinc-600 italic font-light tracking-tight">Zero bloat.</span>
                        </h3>
                    </div>
                </div>

                {/* Floating Content Split */}
                <div className="flex flex-col lg:flex-row gap-20 lg:gap-32 items-center">
                    
                    {/* Left: Interactive Navigation & Text */}
                    <div className="w-full lg:w-5/12 space-y-16">
                        
                        {/* Dynamic Description Area with crossfade */}
                        <div className="min-h-[200px] flex flex-col justify-center relative">
                            {slides.map((slide, idx) => (
                                <div 
                                    key={slide.id}
                                    className={`absolute inset-0 flex flex-col justify-center space-y-6 transition-all duration-700 ease-out ${
                                        currentSlide === idx 
                                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                                        : 'opacity-0 translate-y-4 pointer-events-none'
                                    }`}
                                >
                                    <h4 
                                        className="text-emerald-500/80 font-mono text-sm tracking-[0.2em]"
                                        style={{ fontFamily: "'Geist Mono', monospace" }}
                                    >
                                        // {slide.subtitle.toUpperCase()}
                                    </h4>
                                    <h3 className="text-4xl md:text-5xl font-medium text-white tracking-tight leading-tight">
                                        {slide.title}
                                    </h3>
                                    <p className="text-xl text-zinc-400/80 font-light leading-relaxed">
                                        {slide.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Minimalist List Selector */}
                        <div className="space-y-4 border-l border-white/[0.05] pl-6 mt-16 relative z-10">
                            {slides.map((slide, idx) => {
                                const isActive = currentSlide === idx;
                                return (
                                    <button
                                        key={slide.id}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`group w-full flex items-center gap-4 text-left transition-all duration-500 ${isActive ? 'opacity-100 scale-100 translate-x-2' : 'opacity-40 scale-95 hover:opacity-70'}`}
                                    >
                                        <div className={`w-8 h-px transition-all duration-500 ${isActive ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-white/20'}`} />
                                        <span 
                                            className={`text-sm tracking-widest uppercase transition-colors duration-500 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}
                                            style={{ fontFamily: "'Geist Mono', monospace" }}
                                        >
                                            {slide.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                    </div>

                    {/* Right: Abstract Canvas Visual Centerpiece */}
                    <div className="w-full lg:w-7/12 relative aspect-square max-w-[550px] mx-auto flex items-center justify-center mt-12 lg:mt-0">
                        <InteractiveCanvas 
                            glowColor={getGlowColor(currentData.visualConfig.coreGlow)}
                            particleColor={getParticleColor(currentData.visualConfig.coreGlow)}
                            lineColor={getLineColor(currentData.visualConfig.coreGlow)}
                            coreScale={currentData.visualConfig.coreScale}
                        />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
