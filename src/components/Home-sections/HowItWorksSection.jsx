import React, { useEffect, useRef } from 'react';

export default function HowItWorksSection() {
  const containerRef = useRef(null);

  // Intersection Observer for scroll-linked animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-x-0', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-12', 'translate-x-12', '-translate-x-12');
            
            // Trigger line fill if it's the connecting line wrapper
            const lineFill = entry.target.querySelector('.step-line-fill');
            if (lineFill) {
                lineFill.style.height = '100%';
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -100px 0px" }
    );

    const elements = document.querySelectorAll('.reveal-step');
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, []);

  const steps = [
    {
      title: "ACTIVATE SYSTEM",
      subtitle: "INITIALIZATION PROTOCOL",
      desc: "Initialize the neural model and provide your core objectives. We instantly recalibrate the engine's parameters to match your exact conversational requirements.",
      number: "01",
      visual: (
        // Terminal/Database Ingestion Readout
        <div className="relative w-full h-[300px] border border-white/10 bg-black/40 backdrop-blur-sm p-6 overflow-hidden flex flex-col font-mono text-xs">
           <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 text-zinc-500">
              <span>SYS.INGEST.PDU</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> ACTIVE</span>
           </div>
           
           <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
              <div className="text-emerald-500/80 leading-relaxed font-mono opacity-80 animate-[slideUp_10s_linear_infinite]">
                 {Array.from({length: 15}).map((_, i) => (
                    <div key={i} className="whitespace-nowrap overflow-hidden">
                       [SYS] {Math.random().toString(36).substring(2, 10).toUpperCase()} - HASH: {Math.random().toString(16).substring(2, 20).toUpperCase()} - OK
                    </div>
                 ))}
                 {Array.from({length: 15}).map((_, i) => (
                    <div key={i + 15} className="whitespace-nowrap overflow-hidden">
                       [SYS] {Math.random().toString(36).substring(2, 10).toUpperCase()} - HASH: {Math.random().toString(16).substring(2, 20).toUpperCase()} - OK
                    </div>
                 ))}
              </div>
           </div>
           <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/20">
               <div className="h-full bg-emerald-500 w-full animate-[progress_2s_ease-in-out_infinite]" />
           </div>
        </div>
      )
    },
    {
      title: "FLUID DIALOGUE",
      subtitle: "COGNITIVE ENGAGEMENT",
      desc: "Interact without syntactical constraints. The engine engages in unrestricted conversation, understanding deep underlying nuance and maintaining perfect context seamlessly.",
      number: "02",
      visual: (
        // Abstract Node/Graph Resolution
        <div className="relative w-full h-[300px] border border-white/10 bg-black/40 backdrop-blur-sm p-6 overflow-hidden flex items-center justify-center">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:1rem_1rem]" />
            
            <div className="relative w-[80%] h-[80%] flex items-center justify-center">
                {/* Center Node */}
                <div className="absolute w-12 h-12 border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center rotate-45 z-20">
                    <div className="w-4 h-4 bg-emerald-400 rotate-45 animate-pulse" />
                </div>
                
                {/* Orbiting rings simulating searching */}
                <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-10 border border-emerald-500/20 border-dashed rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                
                {/* Sweeping Radar */}
                <div className="absolute top-1/2 left-1/2 w-full h-1/2 origin-top-left bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 rotateAnimated" />
            </div>
            
            {/* Overlay Metrics */}
            <div className="absolute top-4 right-4 text-[9px] font-mono text-emerald-500/70 text-right leading-relaxed">
               X: {(Math.random() * 100).toFixed(2)}<br/>
               Y: {(Math.random() * 100).toFixed(2)}<br/>
               Z: {(Math.random() * 100).toFixed(2)}
            </div>
        </div>
      )
    },
    {
      title: "GENERATE INSIGHTS",
      subtitle: "INSTANT RESOLUTION",
      desc: "Receive instant, brilliant responses. From complex coding solutions to advanced problem-solving, get actionable output delivered through a frictionless, high-performance interface.",
      number: "03",
      visual: (
        // High-Contrast Data Extraction Output
        <div className="relative w-full h-[300px] border border-emerald-500/20 bg-black/60 p-6 overflow-hidden flex flex-col gap-4">
           {/* Scanline */}
           <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 opacity-50 animate-[scanline_2s_ease-in-out_infinite] z-20" />
           
           <div className="flex justify-between border-b border-emerald-500/30 pb-2">
               <span className="font-mono text-xs text-white">OUTPUT.RESULT</span>
               <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">VERIFIED</span>
           </div>

           <div className="flex-1 space-y-4 pt-2">
               {/* Simulated redacted/highlighted text blocks */}
               <div className="w-full h-3 bg-white/5 relative overflow-hidden">
                   <div className="absolute left-0 top-0 h-full w-[80%] bg-white/20" />
                   <div className="absolute right-0 top-0 h-full w-[15%] bg-emerald-500/30" /> {/* Highlight */}
               </div>
               <div className="w-[90%] h-3 bg-white/5 relative overflow-hidden">
                   <div className="absolute left-0 top-0 h-full w-[40%] bg-emerald-500/30" /> {/* Highlight */}
                   <div className="absolute left-[42%] top-0 h-full w-[50%] bg-white/20" />
               </div>
               <div className="w-[60%] h-3 bg-white/5 relative overflow-hidden">
                   <div className="absolute left-0 top-0 h-full w-[100%] bg-white/20" />
               </div>
               
               <div className="mt-8 pt-4 border-t border-white/5 flex gap-4">
                   <div className="w-8 h-8 flex-shrink-0 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center text-[10px] font-mono text-emerald-400">
                       [1]
                   </div>
                   <div className="flex-1">
                       <div className="w-[40%] h-2 bg-emerald-500/40 mb-2" />
                       <div className="w-[full] h-1.5 bg-white/10" />
                   </div>
               </div>
           </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative w-full py-32 md:py-48 bg-[#070a10] overflow-hidden selection:bg-emerald-500/30 selection:text-white border-t border-white/5">
      
      {/* Texture Layer */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none z-0" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12" ref={containerRef}>
        
        {/* Massive Sticky/Stark Header Layout */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-32 md:mb-48 border-l border-emerald-500 pl-6 md:pl-12">
           <div className="w-full md:w-1/2">
               <h2 className="text-[10px] uppercase font-mono tracking-[0.4em] text-emerald-500 mb-6 flex items-center gap-4">
                  <div className="w-8 h-px bg-emerald-500" />
                  Conversational Protocol
               </h2>
               <h3 className="text-6xl md:text-8xl lg:text-[100px] leading-[0.85] font-black tracking-tighter text-white uppercase break-words w-full">
                  HOW IT <br/>
                  <span className="text-transparent bg-clip-text text-stroke-emerald italic" style={{ WebkitTextStroke: '2px rgba(16, 185, 129, 0.4)', backgroundImage: 'linear-gradient(to bottom, rgba(16,185,129,0.1), transparent)' }}>
                      WORKS.
                  </span>
               </h3>
           </div>
           <div className="w-full md:w-1/2 flex items-end pb-4">
               <p className="max-w-md text-lg md:text-2xl text-zinc-400 font-light leading-relaxed">
                  A highly advanced, intuitive conversational framework designed to turn complex queries into instant, brilliant solutions.
               </p>
           </div>
        </div>

        {/* Structural Vertical Timeline Layout */}
        <div className="w-full relative">
            
            {/* Global background line to guide the eye */}
            <div className="absolute left-6 md:left-[5.5rem] lg:left-[8.5rem] top-0 bottom-0 w-px bg-white/5 pointer-events-none z-0 hidden md:block" />

            <div className="space-y-32 md:space-y-48">
              {steps.map((step, idx) => (
                <div 
                  key={idx}
                  className="reveal-step opacity-0 translate-y-12 transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative flex flex-col md:flex-row gap-12 md:gap-16 lg:gap-32 group"
                >
                    
                    {/* Left Column: Huge Number + Line */}
                    <div className="hidden md:flex flex-col items-center shrink-0 w-32 lg:w-48 relative z-10">
                        {/* Connecting Line Section */}
                        <div className="flex-1 w-full flex justify-center relative min-h-[100px] mb-8">
                             <div className="absolute top-0 bottom-0 w-px bg-white/10" />
                             {/* The actual fill line that animates down via intersection observer */}
                             <div 
                                className="step-line-fill absolute top-0 w-[2px] bg-emerald-500 transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(16,185,129,0.8)]" 
                                style={{ height: '0%' }}
                             />
                        </div>
                        
                        {/* Massive Typography Step Number */}
                        <div className="text-[100px] lg:text-[140px] font-black leading-none text-white/5 group-hover:text-emerald-500/20 transition-colors duration-1000 font-sans tracking-tighter">
                            {step.number}
                        </div>
                    </div>

                    {/* Right Column: Content + Blueprint Visual */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start lg:items-center">
                        
                        {/* Text Block */}
                        <div className="w-full lg:w-1/2 flex flex-col pt-4 md:pt-16 lg:pt-0">
                             
                             {/* Mobile Only Step Number */}
                             <div className="md:hidden text-[80px] font-black leading-none text-white/5 mb-4 group-hover:text-emerald-500/20 transition-colors duration-1000 tracking-tighter">
                                {step.number}
                             </div>

                             <div className="flex items-center gap-4 mb-6">
                               <span className="text-[10px] font-mono tracking-widest text-emerald-400 border border-emerald-500/30 px-3 py-1 bg-emerald-500/5">
                                  {step.subtitle}
                               </span>
                             </div>

                             <h4 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-tight uppercase mb-6 group-hover:text-emerald-300 transition-colors duration-700">
                                {step.title}
                             </h4>
                             <p className="text-zinc-400 font-light text-xl leading-relaxed max-w-xl group-hover:text-zinc-300 transition-colors duration-700">
                                {step.desc}
                             </p>
                        </div>

                        {/* Visual Blueprint/Terminal Block */}
                        <div className="w-full lg:w-1/2">
                             <div className="w-full aspect-video lg:aspect-square max-w-[500px] border border-white/5 bg-white/[0.01] p-2 relative group-hover:border-emerald-500/20 transition-colors duration-1000">
                                  {/* Corner Accents */}
                                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/50" />
                                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/50" />
                                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/50" />
                                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/50" />
                                  
                                  {step.visual}
                             </div>
                        </div>

                    </div>
                    
                </div>
              ))}
            </div>
        </div>

      </div>

      {/* Internal Styles for specific animations inside the blueprint components */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        @keyframes rotateAnimated {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        @keyframes scanline {
            0% { top: 0%; opacity: 0; }
            5% { opacity: 0.5; }
            95% { opacity: 0.5; }
            100% { top: 100%; opacity: 0; }
        }
      `}} />
    </section>
  );
}