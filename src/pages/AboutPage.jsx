import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Zap,
  Shield,
  Users,
  Rocket,
  Brain,
  MessageCircle,
  FileText,
  Lock,
  Bot,
  CheckCircle2,
  Globe,
  Clock,
  Award
} from 'lucide-react';

// Values/Features Data
const coreValues = [
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays yours. We never train on your private documents or share them with anyone.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get instant answers from thousands of documents in milliseconds, not minutes.',
  },
  {
    icon: Target,
    title: 'Accurate & Reliable',
    description: 'Our RAG technology ensures every answer is grounded in your actual data no hallucinations.',
  },
  {
    icon: Users,
    title: 'Built for Everyone',
    description: 'From students to enterprises, our intuitive interface makes AI accessible to all.',
  },
];

// Stats Data
const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '10M+', label: 'Questions Answered' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

// Why Choose Us Data
const whyChooseUs = [
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Chat in any language. Relyce AI understands and responds in 50+ languages seamlessly.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Your AI assistant never sleeps. Get answers anytime, anywhere, on any device.',
  },
  {
    icon: Award,
    title: 'Enterprise Ready',
    description: 'SOC 2 compliant with advanced security features. Trusted by leading organizations.',
  },
];

// Easter egg colors
const easterEggColors = [
  'text-pink-400',
  'text-purple-400',
  'text-cyan-400',
  'text-yellow-400',
  'text-orange-400',
  'text-rose-400',
  'text-indigo-400',
  'text-teal-400',
];

// Sparkle component for animated sparkles
const SparkleEffect = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.8 + Math.random() * 0.4}s`,
          }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute text-yellow-300 animate-bounce"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
            fontSize: `${8 + Math.random() * 8}px`,
          }}
        >
          ✦
        </div>
      ))}
    </div>
  );
};

export default function AboutPage() {
  const [sparkleActive, setSparkleActive] = useState(false);
  const [easterEggIndex, setEasterEggIndex] = useState({});

  const handleEasterEgg = (id) => {
    const randomColor = easterEggColors[Math.floor(Math.random() * easterEggColors.length)];
    setEasterEggIndex(prev => ({ ...prev, [id]: randomColor }));
  };

  const resetEasterEgg = (id) => {
    setEasterEggIndex(prev => ({ ...prev, [id]: null }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">

      {/* Themed Emerald Grid Lines */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div
          className="absolute inset-0 bg-[size:40px_40px] 
          bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),
          linear-gradient(to_bottom,#10b981_1px,transparent_1px)]"
        ></div>
      </div>

      {/* --- Section 1: Hero --- */}
      <section className="relative pt-8 pb-16 lg:pt-12 lg:pb-24">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                About Relyce AI
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Making AI That <span className="text-emerald-400">Actually Understands</span> Your Data
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-gray-400">
                We're building the future of intelligent conversations. Relyce AI transforms how you interact with your documents, providing instant, accurate answers grounded in your own knowledge base.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  to="/chat"
                  className="px-8 py-4 font-semibold rounded-xl shadow-lg bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-105 transform transition duration-300 flex items-center gap-2"
                >
                  <Bot size={20} /> Try Relyce AI
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 font-semibold rounded-xl border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Visual Element - Easter Egg on Brain */}
            <div className="hidden lg:flex justify-center items-center">
              <div
                className="relative cursor-pointer group"
                onMouseEnter={() => handleEasterEgg('brain')}
                onMouseLeave={() => resetEasterEgg('brain')}
              >
                <div className={`absolute inset-0 rounded-full blur-3xl scale-150 transition-all duration-500 ${easterEggIndex['brain'] ? 'bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-cyan-500/30' : 'bg-gradient-to-br from-emerald-500/20 to-transparent'
                  }`}></div>
                <div className={`relative w-72 h-72 rounded-full border-2 bg-[#0a0b10] flex items-center justify-center transition-all duration-300 ${easterEggIndex['brain'] ? 'border-pink-500/60 scale-105' : 'border-emerald-500/40'
                  }`}>
                  <Brain className={`w-28 h-28 transition-all duration-300 ${easterEggIndex['brain'] || 'text-emerald-400'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Stats - Easter Egg on hover --- */}
      <section className="py-12 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-black/20 border border-emerald-500/20 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 group"
                onMouseEnter={() => handleEasterEgg(`stat-${index}`)}
                onMouseLeave={() => resetEasterEgg(`stat-${index}`)}
              >
                <p className={`text-3xl md:text-4xl font-bold transition-all duration-300 ${easterEggIndex[`stat-${index}`] || 'text-emerald-400'}`}>
                  {stat.value}
                </p>
                <p className="mt-2 text-gray-400 text-sm group-hover:text-gray-300 transition-colors">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 3: Our Story --- */}
      <section className="py-20 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Sparkle Icon - Main Easter Egg */}
              <div
                className="relative inline-flex items-center justify-center w-14 h-14 mb-6 rounded-full border-2 bg-[#0a0b10] border-emerald-500/50 cursor-pointer transition-all duration-300 hover:scale-110 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                onMouseEnter={() => setSparkleActive(true)}
                onMouseLeave={() => setSparkleActive(false)}
              >
                <Sparkles className={`w-7 h-7 transition-all duration-300 ${sparkleActive ? 'text-yellow-400 animate-spin' : 'text-emerald-400'}`} />
                <SparkleEffect isActive={sparkleActive} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
              <p className="mt-6 text-gray-400 leading-relaxed">
                Relyce AI was born in Chennai, India in 2024 with a simple mission: to bridge the gap between powerful AI technology and real-world usability.
              </p>
              <p className="mt-4 text-gray-400 leading-relaxed">
                We noticed that while AI was advancing rapidly, most people struggled to get accurate, trustworthy answers from their own documents. Generic chatbots would "hallucinate" facts, and enterprise solutions were too complex and expensive.
              </p>
              <p className="mt-4 text-gray-400 leading-relaxed">
                So we built Relyce AI—an intelligent assistant that combines cutting-edge RAG (Retrieval-Augmented Generation) technology with an intuitive interface that anyone can use.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { year: '2024', event: 'Relyce AI founded in Chennai' },
                { year: 'Q1 2024', event: 'Beta launch with 1,000 early users' },
                { year: 'Q2 2024', event: 'Public launch & Student plan introduced' },
                { year: 'Q3 2024', event: 'Enterprise partnerships begin' },
                { year: 'Today', event: 'Serving 50,000+ users worldwide' },
              ].map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-black/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer group hover:translate-x-2"
                  onMouseEnter={() => handleEasterEgg(`milestone-${index}`)}
                  onMouseLeave={() => resetEasterEgg(`milestone-${index}`)}
                >
                  <div className={`w-3 h-3 mt-1.5 rounded-full shrink-0 transition-all duration-300 ${easterEggIndex[`milestone-${index}`] ? 'bg-yellow-400 scale-150 shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 'bg-emerald-500'
                    }`}></div>
                  <div>
                    <p className={`font-semibold transition-all duration-300 ${easterEggIndex[`milestone-${index}`] || 'text-emerald-400'}`}>
                      {milestone.year}
                    </p>
                    <p className="text-gray-300 text-sm group-hover:text-white transition-colors">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 4: Core Values --- */}
      <section className="py-20 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-full border-2 bg-[#0a0b10] border-emerald-500/50 mx-auto cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-180 hover:border-purple-400"
              onMouseEnter={() => handleEasterEgg('target')}
              onMouseLeave={() => resetEasterEgg('target')}
            >
              <Target className={`w-7 h-7 transition-all duration-300 ${easterEggIndex['target'] || 'text-emerald-400'}`} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">What Drives Us</h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Our core values shape every feature we build and every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-black/20 border border-emerald-500/30 text-center transition-all duration-300 hover:scale-105 hover:border-emerald-500/60 cursor-pointer"
                onMouseEnter={() => handleEasterEgg(`value-${index}`)}
                onMouseLeave={() => resetEasterEgg(`value-${index}`)}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full border-2 bg-[#0a0b10] transition-all duration-300 ${easterEggIndex[`value-${index}`] ? 'border-pink-400 rotate-12' : 'border-emerald-500/50 group-hover:border-emerald-400'
                  }`}>
                  <value.icon className={`w-6 h-6 transition-all duration-300 ${easterEggIndex[`value-${index}`] || 'text-emerald-400'}`} />
                </div>
                <h3 className="text-lg font-bold">{value.title}</h3>
                <p className="mt-2 text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 5: How It Works --- */}
      <section className="py-20 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-full border-2 bg-[#0a0b10] border-emerald-500/50 mx-auto cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-2 hover:border-orange-400"
              onMouseEnter={() => handleEasterEgg('rocket')}
              onMouseLeave={() => resetEasterEgg('rocket')}
            >
              <Rocket className={`w-7 h-7 transition-all duration-300 ${easterEggIndex['rocket'] || 'text-emerald-400'}`} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">How Relyce AI Works</h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Our RAG technology ensures every answer is accurate and verifiable.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileText, step: '1', title: 'Upload Your Documents', description: 'Simply upload PDFs, docs, or connect your knowledge base. We securely process and index your content.' },
              { icon: MessageCircle, step: '2', title: 'Ask Any Question', description: 'Chat naturally in any language. Ask complex questions, request summaries, or extract specific data.' },
              { icon: CheckCircle2, step: '3', title: 'Get Verified Answers', description: 'Receive instant, accurate answers with citations pointing directly to the source in your documents.' },
            ].map((item, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-black/20 border border-emerald-500/30 text-center transition-all duration-300 hover:scale-105 cursor-pointer group"
                onMouseEnter={() => handleEasterEgg(`step-${index}`)}
                onMouseLeave={() => resetEasterEgg(`step-${index}`)}
              >
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 transition-all duration-300 ${easterEggIndex[`step-${index}`] ? 'scale-125' : ''
                  }`}>
                  <span className={`inline-flex items-center justify-center w-7 h-7 font-bold rounded-full text-sm transition-all duration-300 ${easterEggIndex[`step-${index}`] ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'bg-emerald-500 text-black'
                    }`}>
                    {item.step}
                  </span>
                </div>
                <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 mt-2 rounded-full border-2 bg-[#0a0b10] transition-all duration-300 ${easterEggIndex[`step-${index}`] ? 'border-cyan-400' : 'border-emerald-500/50'
                  }`}>
                  <item.icon className={`w-6 h-6 transition-all duration-300 ${easterEggIndex[`step-${index}`] || 'text-emerald-400'}`} />
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-gray-400 text-sm group-hover:text-gray-300 transition-colors">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 6: Why Choose Us --- */}
      <section className="py-20 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-full border-2 bg-[#0a0b10] border-emerald-500/50 mx-auto cursor-pointer transition-all duration-300 hover:scale-110 hover:border-yellow-400"
              onMouseEnter={() => handleEasterEgg('award')}
              onMouseLeave={() => resetEasterEgg('award')}
            >
              <Award className={`w-7 h-7 transition-all duration-300 ${easterEggIndex['award'] || 'text-emerald-400'}`} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose Relyce AI?</h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              We go beyond basic chatbots to deliver a truly intelligent experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-black/20 border border-emerald-500/30 text-center hover:border-emerald-500/60 transition-all duration-300 cursor-pointer hover:scale-105"
                onMouseEnter={() => handleEasterEgg(`why-${index}`)}
                onMouseLeave={() => resetEasterEgg(`why-${index}`)}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full border-2 bg-[#0a0b10] transition-all duration-300 ${easterEggIndex[`why-${index}`] ? 'border-teal-400 rotate-6' : 'border-emerald-500/50'
                  }`}>
                  <item.icon className={`w-6 h-6 transition-all duration-300 ${easterEggIndex[`why-${index}`] || 'text-emerald-400'}`} />
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 7: CTA --- */}
      <section className="py-20 relative z-10">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div
            className="p-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/30 transition-all duration-500 hover:from-purple-500/10 hover:to-pink-500/5 hover:border-purple-500/30 cursor-pointer"
            onMouseEnter={() => handleEasterEgg('cta')}
            onMouseLeave={() => resetEasterEgg('cta')}
          >
            <Lock className={`mx-auto w-10 h-10 mb-4 transition-all duration-300 ${easterEggIndex['cta'] || 'text-emerald-400'}`} />
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Transform How You Work?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-gray-400 text-sm">
              Join thousands of users who trust Relyce AI to make sense of their data. Start for free—no credit card required.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link
                to="/chat"
                className="px-6 py-3 font-semibold rounded-xl shadow-lg bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-105 transform transition duration-300 flex items-center gap-2"
              >
                <Bot size={18} /> Start Free Trial
              </Link>
              <Link
                to="/membership"
                className="px-6 py-3 font-semibold rounded-xl border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
