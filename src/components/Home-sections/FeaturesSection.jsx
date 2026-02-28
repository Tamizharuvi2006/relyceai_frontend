import React, { useRef, useEffect } from "react";

const FeaturesSection = () => {
  const scrollContainerRef = useRef(null);
  
  const features = [
    {
      id: "01",
      title: "LIGHTNING",
      suffix: "FAST",
      desc: "Instant responses powered by an architecture that never sleeps. We stripped away the bloat so you can move at the speed of thought. Zero-latency neural routing engineered for high-frequency operations.",
    },
    {
      id: "02",
      title: "TRUE",
      suffix: "INTELLIGENCE",
      desc: "Beyond simple pattern matching. Our models grasp the nuance, intent, and subtle context behind your specific workflows. Context that actually understands the underlying systems.",
    },
    {
      id: "03",
      title: "LIMITLESS",
      suffix: "SCALE",
      desc: "An infrastructure designed to grow seamlessly alongside your wildest ambitions. Built for the future, ready to deploy today. Engineered natively for massive enterprise expansion.",
    }
  ];

  // Optional: Intersection Observer to handle revealing elements as they scroll into view
  useEffect(() => {
     const observer = new IntersectionObserver(
         (entries) => {
             entries.forEach(entry => {
                 if(entry.isIntersecting) {
                     entry.target.classList.add('opacity-100', 'translate-y-0');
                     entry.target.classList.remove('opacity-0', 'translate-y-12');
                 }
             });
         },
         { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
     );

     const elements = document.querySelectorAll('.reveal-on-scroll');
     elements.forEach(el => observer.observe(el));

     return () => {
         elements.forEach(el => observer.unobserve(el));
     };
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#070a10] overflow-hidden selection:bg-emerald-500/30 selection:text-white">
      
      {/* Texture Layer */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none z-0" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      {/* Structural Grids */}
      <div className="absolute inset-0 pointer-events-none z-0 flex justify-between px-6 lg:px-12 w-full max-w-[1600px] mx-auto opacity-10">
          <div className="w-px h-full bg-white" />
          <div className="w-px h-full bg-white hidden md:block" />
          <div className="w-px h-full bg-white hidden lg:block" />
          <div className="w-px h-full bg-white" />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-32 lg:py-48 flex flex-col lg:flex-row gap-24 lg:gap-0">
        
        {/* Left constraints & Sticky Header */}
        <div className="w-full lg:w-5/12 lg:sticky top-32 h-fit flex flex-col gap-12 pr-0 lg:pr-20 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
            
            <div className="flex items-center gap-6">
               <div className="h-px flex-1 bg-white/20" />
               <span className="font-mono text-xs uppercase tracking-[0.4em] text-emerald-500 whitespace-nowrap">System Architecture</span>
            </div>

            <h2 className="text-6xl md:text-8xl lg:text-[100px] leading-[0.85] font-medium tracking-tighter text-white">
                THE<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-500 to-zinc-800 italic pr-4">ENGINE</span>
            </h2>

            <p className="text-zinc-400 font-light text-lg md:text-xl leading-relaxed max-w-md">
                We discarded conventional constraints to build an infrastructure that operates at the absolute edge of possibility. No shortcuts. No bloat.
            </p>

            {/* Abstract Decorative Element */}
            <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center relative mt-12 overflow-hidden group">
                 <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-700" />
                 <div className="w-full h-px bg-white/20 rotate-45 transform origin-center transition-transform duration-1000 group-hover:rotate-[225deg]" />
                 <div className="w-px h-full bg-white/20 rotate-45 transform origin-center transition-transform duration-1000 group-hover:rotate-[225deg]" />
            </div>
        </div>

        {/* Right Content Stream (Scrolling) */}
        <div className="w-full lg:w-7/12 flex flex-col border-l border-white/10" ref={scrollContainerRef}>
            {features.map((feature, idx) => (
                <div 
                    key={feature.id}
                    className="group relative flex flex-col justify-center px-6 md:px-16 py-32 md:py-40 border-b border-white/10 overflow-hidden reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                    style={{ transitionDelay: `${idx * 150}ms` }}
                >
                    {/* Hover Glow */}
                    <div className="absolute top-1/2 -right-1/4 w-[150%] h-[150%] -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    
                    {/* Interaction Line */}
                    <div className="absolute left-0 top-0 w-[2px] h-0 bg-emerald-500 group-hover:h-full transition-all duration-700 ease-[cubic-bezier(0.2,1,0.3,1)]" />

                    {/* Massive Background Number */}
                    <div className="absolute -top-12 -right-8 md:-top-24 md:-right-12 text-[200px] md:text-[300px] font-bold text-white/[0.02] group-hover:text-emerald-500/[0.04] transition-colors duration-[1500ms] pointer-events-none select-none font-sans leading-none tracking-tighter mix-blend-screen">
                        {feature.id}
                    </div>

                    <div className="relative z-10 flex flex-col gap-6 w-full max-w-2xl">
                        {/* Title Block */}
                        <div className="flex flex-col mb-4">
                            <h3 className="text-4xl md:text-6xl font-medium tracking-tighter text-zinc-100 group-hover:text-white transition-colors duration-500">
                                {feature.title}
                            </h3>
                            <div className="flex items-center gap-6 text-2xl md:text-4xl font-light italic tracking-tight text-zinc-500">
                                <span className="w-12 h-px bg-zinc-700 group-hover:bg-emerald-500/50 group-hover:w-24 transition-all duration-700" />
                                <span className="group-hover:text-emerald-400 transition-colors duration-700">{feature.suffix}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-zinc-500 group-hover:text-zinc-300 text-lg md:text-xl font-light leading-relaxed transition-colors duration-700 relative z-20">
                            {feature.desc}
                        </p>

                        {/* Interactive UI element (Fake Button/Readout) */}
                        <div className="mt-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100">
                             <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-full bg-emerald-500/5 backdrop-blur-sm">
                                 Active Module
                             </div>
                             <div className="flex gap-1">
                                 {[1,2,3].map(i => (
                                     <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;