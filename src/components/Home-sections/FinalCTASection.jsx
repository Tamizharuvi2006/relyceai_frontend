import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FinalCTASection() {
  const marqueeRef = useRef(null);

  // Simple marquee animation loop
  useEffect(() => {
    let animationFrameId;
    let position = 0;
    
    const animate = () => {
        position -= 0.5; // Speed of ticker
        if(marqueeRef.current) {
             // Reset when the first identical block moves out of frame (assuming 50% width covers it)
             if(Math.abs(position) >= marqueeRef.current.scrollWidth / 2) {
                 position = 0;
             }
             marqueeRef.current.style.transform = `translateX(${position}px)`;
        }
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const marqueeText = "LIMITLESS CONVERSATION • ZERO LATENCY • HYPER AWARE • SECURE ENCLAVE • CREATIVE INTELLIGENCE • ENTERPRISE GRADE • ";

  return (
    <section className="relative w-full bg-[#070a10] overflow-hidden selection:bg-emerald-500/30 selection:text-white border-t border-white/5">
      
      {/* Texture Layer */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none z-0" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      {/* Background Ambient Glow */}
      <div className="absolute -bottom-[400px] -right-[200px] w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Structural Grids */}
      <div className="absolute inset-0 pointer-events-none z-0 flex justify-between px-6 lg:px-12 w-full max-w-[1600px] mx-auto opacity-[0.03]">
          {/* Vertical Grid Lines */}
          <div className="w-px h-full bg-white" />
          <div className="w-px h-full bg-white hidden md:block" />
          <div className="w-px h-full bg-white hidden lg:block" />
          <div className="w-px h-full bg-white" />
          
          {/* Horizontal Grid Line */}
          <div className="absolute top-[30%] left-0 w-full h-px bg-white" />
          <div className="absolute top-[70%] left-0 w-full h-px bg-white" />
      </div>

      {/* Ticker Tape Background */}
      <div className="absolute top-20 left-0 w-[200vw] overflow-hidden whitespace-nowrap opacity-[0.03] pointer-events-none select-none mix-blend-screen -rotate-2 origin-left">
          <div ref={marqueeRef} className="inline-block text-[150px] font-black tracking-tight" style={{ fontFamily: "'Geist Mono', monospace" }}>
             {marqueeText}{marqueeText}{marqueeText}
          </div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-32 lg:py-48 flex flex-col items-start min-h-[80vh] justify-center">
          
          <div className="w-full flex flex-col lg:flex-row items-end justify-between gap-12 lg:gap-24">
              
              {/* Massive Left Typography */}
              <div className="w-full lg:w-3/4 flex flex-col relative">
                  
                  {/* Subtle technical readout */}
                  <div className="absolute -top-12 left-2 flex items-center gap-4 text-[10px] uppercase font-mono text-zinc-500 tracking-[0.2em]">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      SYSTEM_READY // INITIATE_START
                  </div>

                  <h2 className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[140px] leading-[0.85] font-black tracking-tighter text-white uppercase break-words w-full">
                      <span className="block text-zinc-100 hover:text-emerald-400 transition-colors duration-700">COMMENCE</span>
                      <span 
                         className="block text-transparent bg-clip-text"
                         style={{ WebkitTextStroke: '2px rgba(16, 185, 129, 0.4)', backgroundImage: 'linear-gradient(to bottom, rgba(16,185,129,0.1), transparent)' }}
                      >
                         OPERATIONS.
                      </span>
                  </h2>

                  <p className="max-w-xl text-lg md:text-2xl text-zinc-400 font-light leading-relaxed mt-12 pl-2 md:pl-4 border-l-2 border-emerald-500/30">
                     Stop searching. Start conversing. Deploy your advanced AI assistant and generate brilliant ideas, code, and insights instantaneously. The engine is waiting.
                  </p>
              </div>

              {/* Custom Oversized Interactive Block CTA */}
              <div className="w-full lg:w-1/4 flex justify-end lg:justify-start pt-12 lg:pt-0">
                  <Link 
                      to="/chat" 
                      className="group relative w-full aspect-square max-w-[400px] lg:h-[400px] border border-white/10 overflow-hidden flex flex-col justify-between p-8 md:p-12 hover:border-emerald-500/50 transition-colors duration-700"
                  >
                      {/* Interactive Hover Fill */}
                      <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.2,1,0.3,1)]" />
                      
                      {/* Background Scanline */}
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400/50 opacity-0 group-hover:opacity-100 group-hover:animate-[scanline_2s_ease-in-out_infinite]" />

                      <div className="relative z-10 flex justify-between items-start w-full">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 group-hover:text-emerald-400 transition-colors duration-500">
                             Initialize Chat
                          </span>
                      </div>

                      <div className="relative z-10 flex items-end justify-between w-full">
                          <h3 className="text-4xl md:text-5xl font-medium tracking-tighter text-white group-hover:text-emerald-300 transition-colors duration-500">
                              DEPLOY
                          </h3>
                          <div className="w-16 h-16 md:w-20 md:h-20 border border-white/20 rounded-full flex items-center justify-center group-hover:border-emerald-400 group-hover:bg-emerald-400/10 transition-all duration-500 transform group-hover:-rotate-45">
                              <ArrowRight className="w-8 h-8 text-white group-hover:text-emerald-400 transition-colors duration-500" />
                          </div>
                      </div>
                  </Link>
              </div>

          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline {
            0% { top: 0%; opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}} />
    </section>
  );
}