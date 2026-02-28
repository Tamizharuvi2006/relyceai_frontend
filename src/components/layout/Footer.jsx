import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative bg-[#030508] text-white overflow-hidden pt-32 pb-8 border-t border-white/5">
      
      {/* Abstract Background Noise */}
      <div 
           className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Top Section: Brand Statement & Contact */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-32">
          
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-light leading-snug mb-8">
              Intelligence isn't artificial. <br />
              <span className="text-zinc-500 italic">It's engineered.</span>
            </h2>
            <p className="text-zinc-400 font-light leading-relaxed max-w-md">
              We build conversational layers that transform how humans interact with their most critical knowledge. Designed in clarity. Built for trust.
            </p>
          </div>

          <div className="flex flex-col gap-12 lg:min-w-[400px]">
             {/* Contact Block */}
             <div>
                <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-600 block mb-6">Inquiries</span>
                <a href="mailto:hello@relyce.ai" className="text-2xl font-light border-b border-white/20 pb-1 hover:border-white transition-colors duration-500">
                    hello@relyce.ai
                </a>
             </div>
             
             {/* Simple, Structurally elegant navigation */}
             <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <Link to="/" className="text-zinc-400 hover:text-white transition-colors duration-300 font-light origin-left hover:translate-x-1 inline-block">Platform</Link>
                <Link to="/about" className="text-zinc-400 hover:text-white transition-colors duration-300 font-light origin-left hover:translate-x-1 inline-block">Story</Link>
                <Link to="/membership" className="text-zinc-400 hover:text-white transition-colors duration-300 font-light origin-left hover:translate-x-1 inline-block">Pricing</Link>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors duration-300 font-light origin-left hover:translate-x-1 inline-block">Careers</a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors duration-300 font-light origin-left hover:translate-x-1 inline-block">Twitter/X</a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors duration-300 font-light origin-left hover:translate-x-1 inline-block">LinkedIn</a>
             </div>
          </div>

        </div>

        {/* Bottom Section: Legal & Massive Typography */}
        <div className="flex flex-col border-t border-white/10 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-600 mb-16 lg:mb-24">
                <div className="flex items-center gap-3">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
                     <span>EST. 2024</span>
                </div>
                <div className="flex gap-8">
                    <Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
                </div>
                <div>
                     &copy; RELYCE INFOTECH
                </div>
            </div>

            {/* Massive edge-to-edge text */}
            <div className="w-full overflow-hidden flex justify-center opacity-[0.03] select-none pointer-events-none -mb-16">
                 <h1 className="text-[22vw] leading-none font-bold tracking-tighter">
                     RELYCE
                 </h1>
            </div>
        </div>

      </div>
    </footer>
  );
}