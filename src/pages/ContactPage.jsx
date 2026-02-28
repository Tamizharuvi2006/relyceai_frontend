import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast, { Toaster } from 'react-hot-toast';

const AnimatedGradientText = ({ children, className }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-100 animate-[bg-pan_8s_linear_infinite] ${className}`} style={{ backgroundSize: '200% auto' }}>
    {children}
  </span>
);

export default function ContactPage() {
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    intent: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Inquiry received. We will respond shortly.', {
      style: {
        background: '#111',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)'
      }
    });
    
    setFormData({ name: '', email: '', intent: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <main className="relative min-h-screen bg-[#030508] text-white selection:bg-white/10 selection:text-white font-sans overflow-hidden">
      <Helmet>
        <title>Connect | Relyce AI</title>
        <meta name="description" content="Get in touch with the Relyce engineering and partnerships team." />
      </Helmet>
      
      <Toaster position="bottom-right" />

      {/* Deep, Restrained Atmospheric Overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
            className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] bg-emerald-500/[0.02] rounded-full blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out" 
            style={{ transform: `translateY(${scrollY * 0.05}px)`}}
        />
        <div 
           className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-40">
        
        {/* --- Header --- */}
        <div className="mb-24 md:mb-40 flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-white/5 pb-16">
            <div className="max-w-2xl">
                <div className="mb-8 flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.2em] font-mono text-zinc-500 uppercase">Communicate</span>
                    <div className="w-12 h-px bg-white/10" />
                </div>
                
                <h1 className="text-5xl sm:text-7xl md:text-[90px] font-medium tracking-tight leading-[1] -ml-1">
                    <span className="text-zinc-500">Begin the</span><br />
                    <AnimatedGradientText>Dialogue.</AnimatedGradientText>
                </h1>
            </div>

            <div className="max-w-sm">
                <p className="text-lg text-zinc-400 font-light leading-relaxed">
                    Direct access to the team building the conversational layer for modern knowledge work.
                </p>
            </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Contact Information (Left Column) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
                
                <div className="space-y-20">
                    {/* Primary Contact */}
                    <div>
                        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-600 block mb-6">Direct Line</span>
                        <a href="mailto:hello@relyce.ai" className="text-3xl lg:text-4xl font-light border-b border-white/20 pb-2 hover:border-white transition-colors duration-500 inline-block">
                            hello@relyce.ai
                        </a>
                    </div>
                    
                    {/* Structure/Offices */}
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-600 block mb-4">Headquarters</span>
                            <address className="not-italic text-zinc-400 font-light leading-relaxed">
                                Relyce Infotech<br />
                                Chennai, India<br />
                                EST. 2024
                            </address>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-600 block mb-4">Support Hours</span>
                            <p className="text-zinc-400 font-light leading-relaxed">
                                Mon - Fri<br />
                                09:00 - 18:00 IST<br />
                                <span className="text-emerald-500/70 text-xs mt-2 block">Enterprise: 24/7</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Socials / Links */}
                <div className="pt-20 lg:pt-0 mt-20 border-t border-white/5 lg:border-none">
                     <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-600 block mb-6">Network</span>
                     <div className="flex gap-8">
                         <a href="#" className="text-zinc-400 hover:text-white transition-colors font-light">Twitter / X</a>
                         <a href="#" className="text-zinc-400 hover:text-white transition-colors font-light">LinkedIn</a>
                     </div>
                </div>

            </div>

            {/* Delimiter Layer */}
            <div className="hidden lg:block lg:col-span-1 border-l border-white/5 relative">
                 <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent h-1/2" />
            </div>

            {/* Contact Form (Right Column) */}
            <div className="lg:col-span-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-12">
                    
                    {/* Name & Email Row */}
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="relative group">
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent border-b border-white/10 py-4 text-white font-light focus:outline-none focus:border-white transition-colors peer placeholder-transparent"
                                placeholder="Name"
                            />
                            <label className="absolute left-0 top-4 text-zinc-500 text-sm font-light transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-zinc-400 peer-valid:-top-4 peer-valid:text-[10px] pointer-events-none uppercase tracking-widest">
                                Your full name
                            </label>
                        </div>

                        <div className="relative group">
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent border-b border-white/10 py-4 text-white font-light focus:outline-none focus:border-white transition-colors peer placeholder-transparent"
                                placeholder="Email"
                            />
                            <label className="absolute left-0 top-4 text-zinc-500 text-sm font-light transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-zinc-400 peer-valid:-top-4 peer-valid:text-[10px] pointer-events-none uppercase tracking-widest">
                                Email address
                            </label>
                        </div>
                    </div>

                    {/* Intent Select */}
                    <div className="relative group">
                        <select 
                            name="intent"
                            value={formData.intent}
                            onChange={handleChange}
                            required
                            className="w-full bg-transparent border-b border-white/10 py-4 text-zinc-400 font-light focus:outline-none focus:border-white focus:text-white transition-colors appearance-none cursor-pointer"
                        >
                            <option value="" disabled className="bg-[#030508]">Select intent</option>
                            <option value="enterprise" className="bg-[#030508]">Enterprise Solutions</option>
                            <option value="support" className="bg-[#030508]">Technical Support</option>
                            <option value="partnership" className="bg-[#030508]">Partnership</option>
                            <option value="other" className="bg-[#030508]">General Inquiry</option>
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-500">
                                <path d="M1 1.5L6 6.5L11 1.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className="relative group mt-4">
                        <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-light focus:outline-none focus:border-white transition-colors peer placeholder-transparent resize-none"
                            placeholder="Message"
                        />
                        <label className="absolute left-0 top-4 text-zinc-500 text-sm font-light transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-zinc-400 peer-valid:-top-4 peer-valid:text-[10px] pointer-events-none uppercase tracking-widest">
                            How can we help?
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex items-center justify-center px-10 py-5 bg-white text-black font-medium text-sm tracking-widest uppercase overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                        >
                            <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
                            <span className="relative z-10 mix-blend-difference text-white">
                                {isSubmitting ? 'Transmitting...' : 'Send Message'}
                            </span>
                        </button>
                    </div>

                </form>
            </div>

        </div>
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
