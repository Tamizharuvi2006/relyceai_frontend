import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AnimatedGradientText = ({ children, className }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-100 animate-[bg-pan_8s_linear_infinite] ${className}`} style={{ backgroundSize: '200% auto' }}>
    {children}
  </span>
);

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#030508] text-white selection:bg-white/10 selection:text-white font-sans overflow-hidden">
        
      {/* Deep, Restrained Atmospheric Overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Abstract Blur Orbs - drastically toned down to just provide a hint of life */}
        <div 
            className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] bg-emerald-500/[0.02] rounded-full blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out" 
            style={{ transform: `translateY(${scrollY * 0.05}px)`}}
        />
        <div 
            className="absolute top-[60%] -left-[10%] w-[40vw] h-[40vw] bg-zinc-500/[0.02] rounded-full blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out" 
            style={{ transform: `translateY(${scrollY * -0.02}px)`}}
        />

        {/* Persistent subtle noise texture */}
        <div 
           className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
          
        {/* --- Hero: The Human Element --- */}
        <section className="min-h-[85vh] flex flex-col justify-end pb-24 lg:pb-32 border-b border-white/5 relative">
            
            <div className="max-w-[1200px]">
                <div className="mb-10 flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.2em] font-mono text-zinc-500 uppercase">Our Story</span>
                    <div className="w-12 h-px bg-white/10" />
                </div>
                
                <h1 className="text-5xl sm:text-7xl md:text-[90px] lg:text-[110px] font-medium tracking-tight leading-[1] -ml-1">
                    <span className="text-zinc-500">Clarity from</span><br />
                    <AnimatedGradientText>Complexity.</AnimatedGradientText>
                </h1>
                
                <div className="mt-16 flex flex-col md:flex-row gap-8 md:gap-24 items-start">
                    <p className="text-lg md:text-2xl text-zinc-400 font-light leading-relaxed max-w-xl">
                      We started Relyce because teams were drowning in their own documentation. We wanted to build an elegant, conversational layer that makes finding answers feel as natural as asking a colleague.
                    </p>
                    <div className="flex flex-col gap-4 border-l border-white/10 pl-6 mt-2">
                         <span className="text-zinc-300 font-light italic max-w-xs">Connecting human curiosity with the right context, instantly.</span>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Abstract Statistics - Restrained --- */}
        <section className="py-24 border-b border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/[0.02]">
                {[
                    { val: '50K+', lbl: 'Active Users' },
                    { val: '10M+', lbl: 'Questions Answered' },
                    { val: '99.9%', lbl: 'Uptime' },
                    { val: '100%', lbl: 'Data Privacy' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#030508] p-10 flex flex-col justify-between aspect-[3/2] group hover:bg-white/[0.01] transition-colors duration-700">
                        <span className="text-[10px] font-mono text-zinc-600">0{i + 1}</span>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light text-white mb-2">{stat.val}</div>
                            <div className="text-xs uppercase tracking-widest text-zinc-500">{stat.lbl}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* --- Core Philosophy --- */}
        <section className="py-40 border-b border-white/5 relative">
            <div className="absolute top-0 bottom-0 left-[30%] w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent hidden lg:block" />

            <div className="max-w-[1000px] mx-auto">
                <div className="mb-24">
                    <h2 className="text-2xl lg:text-4xl font-light leading-tight text-white max-w-2xl">
                        A tool is only as good as the trust it builds. We designed Relyce around three core principles.
                    </h2>
                </div>

                <div className="space-y-24">
                     {[
                         { title: 'Your Knowledge, Secured', text: 'We believe your data is yours. Relyce reads your documents to answer your questions, but it never uses your proprietary information to train public models. Period.' },
                         { title: 'Frictionless Experience', text: 'You shouldn\'t need to be an engineer to get answers. We focused on building a clean, intuitive interface that feels incredibly fast and immediately familiar.' },
                         { title: 'Grounded Responses', text: 'Knowing the source is just as important as knowing the answer. We designed our system to always cite its sources, providing transparency and verifiable accuracy.' },
                     ].map((item, i) => (
                         <div key={i} className="flex flex-col md:flex-row gap-8 lg:gap-24 group">
                             <div className="md:w-1/3 flex items-start gap-4">
                                 <span className="text-sm font-mono text-emerald-500/50 pt-1.5">0{i+1}.</span>
                                 <h3 className="text-xl tracking-tight text-zinc-200 font-light">{item.title}</h3>
                             </div>
                             <div className="md:w-2/3">
                                 <p className="text-lg lg:text-xl font-light text-zinc-400 leading-relaxed max-w-lg">
                                     {item.text}
                                 </p>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        </section>

        {/* --- How it Works (Humanized) --- */}
        <section className="py-40 relative">
             <div className="flex flex-col items-center justify-center text-center mb-24">
                 <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-white mb-6">How Relyce Fits In.</h2>
                 <p className="text-zinc-400 font-light max-w-md">Designed to bridge the gap between your sprawling documentation and the specific answers your team needs.</p>
             </div>

             <div className="flex flex-col lg:flex-row justify-between items-stretch gap-12 relative max-w-[1000px] mx-auto">                 
                 {[
                     { step: 'Connect', text: 'Link your existing knowledge bases, PDFs, and documentation securely.' },
                     { step: 'Ask', text: 'Type questions naturally, as if you were asking a domain expert on your team.' },
                     { step: 'Understand', text: 'Receive clear, cited answers drawn directly from your own materials.' }
                 ].map((step, i) => (
                     <div key={i} className="flex flex-col relative w-full lg:w-1/3 group">
                         <div className="h-px w-full bg-white/10 mb-8 relative">
                             <div className="absolute top-0 left-0 h-full w-0 bg-emerald-500 group-hover:w-full transition-all duration-1000 ease-out" />
                         </div>
                         
                         <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-4">Phase {i + 1}</span>
                         <h3 className="text-2xl font-light text-white mb-4">{step.step}</h3>
                         <p className="text-zinc-400 font-light">{step.text}</p>
                     </div>
                 ))}
             </div>
        </section>

        {/* --- Subtle Final CTA --- */}
        <section className="w-full flex justify-center pb-32">
            <div className="relative w-full border-t border-white/10 pt-24 pb-8 flex flex-col items-center">
                
                <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white text-center mb-10">
                    Ready to bring clarity <br className="hidden md:block"/> to your workflow?
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full max-w-sm">
                    <Link
                        to="/chat"
                        className="flex-1 flex items-center justify-center px-8 py-4 bg-white text-black font-medium tracking-wide hover:bg-zinc-200 transition-colors duration-300"
                    >
                        Start Exploring
                    </Link>
                    <Link
                        to="/membership"
                        className="flex-1 flex items-center justify-center px-8 py-4 border border-white/20 text-white font-medium tracking-wide hover:bg-white/5 transition-colors duration-300"
                    >
                        View Plans
                    </Link>
                </div>
            </div>
        </section>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bg-pan {
            0% { background-position: 0% center; }
            100% { background-position: -200% center; }
        }
      `}} />
    </main>
  );
}
