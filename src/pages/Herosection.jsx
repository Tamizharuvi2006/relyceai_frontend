import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, BrainCircuit, Users, Shield, Send, Sparkles } from "lucide-react";

const HeroSection = () => {
  const canvasRef = useRef(null);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Easter Egg States
  const [clickSparks, setClickSparks] = useState([]);
  const [titleClicks, setTitleClicks] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [currentRoast, setCurrentRoast] = useState("");
  const [countdown, setCountdown] = useState(8);
  const [featureEasterEggs, setFeatureEasterEggs] = useState({});
  const [chatGlow, setChatGlow] = useState(false);

  const easterEggColors = ['text-pink-400', 'text-purple-400', 'text-cyan-400', 'text-yellow-400', 'text-orange-400'];

  // Roasting messages for easter egg
  const roastMessages = [
    "Still clicking? You must be really bored 💀",
    "Go touch some grass... after using Relyce AI 🌱",
    "You clicked 3 times. That's 3x more effort than your last project 😏",
    "Congrats! You found me. Now go do something productive 🔥",
    "AI can't fix your procrastination... but we can help with everything else 😎",
  ];

  // Click spark effect
  const handlePageClick = (e) => {
    if (Math.random() > 0.6) { // 40% chance
      const id = Date.now();
      setClickSparks(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setClickSparks(prev => prev.filter(s => s.id !== id)), 800);
    }
  };

  // Secret message on title click (3 clicks)
  const handleTitleClick = () => {
    setTitleClicks(prev => prev + 1);
    if (titleClicks >= 2) { // 3 clicks (0, 1, 2)
      // Pick ONE random message
      const randomMessage = roastMessages[Math.floor(Math.random() * roastMessages.length)];
      setCurrentRoast(randomMessage);
      setShowSecret(true);
      setCountdown(8);

      // Start countdown
      let count = 8;
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setShowSecret(false);
        }
      }, 1000);

      setTitleClicks(0);
    }
  };

  // Feature card easter egg
  const handleFeatureHover = (index) => {
    const randomColor = easterEggColors[Math.floor(Math.random() * easterEggColors.length)];
    setFeatureEasterEggs(prev => ({ ...prev, [index]: randomColor }));
  };

  const resetFeatureHover = (index) => {
    setFeatureEasterEggs(prev => ({ ...prev, [index]: null }));
  };

  // Typewriter effect for placeholder
  const questions = [
    "What can you help me with?",
    "Explain quantum computing...",
    "Write a poem about AI...",
  ];

  useEffect(() => {
    let questionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout;

    const type = () => {
      const currentQuestion = questions[questionIndex];

      if (!isDeleting) {
        // Typing
        setPlaceholderText(currentQuestion.substring(0, charIndex + 1));
        charIndex++;

        if (charIndex === currentQuestion.length) {
          // Pause at end of word before deleting
          isDeleting = true;
          timeout = setTimeout(type, 2000);
          return;
        }
        timeout = setTimeout(type, 80); // Type speed
      } else {
        // Deleting
        setPlaceholderText(currentQuestion.substring(0, charIndex - 1));
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          questionIndex = (questionIndex + 1) % questions.length;
          timeout = setTimeout(type, 500); // Pause before next question
          return;
        }
        timeout = setTimeout(type, 40); // Delete speed (faster)
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, []);

  // Background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    // Floating particles - FULL SCREEN
    const particles = [];
    const numParticles = w < 768 ? 30 : 60;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: 0.1 + Math.random() * 0.4,
      });
    }

    const draw = () => {
      ctx.fillStyle = "rgba(5,6,10,0.1)";
      ctx.fillRect(0, 0, w, h);

      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };
    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  const features = [
    { icon: BrainCircuit, title: "Advanced", subtitle: "Reasoning" },
    { icon: Users, title: "Real-time", subtitle: "Collaboration" },
    { icon: Shield, title: "Secure &", subtitle: "Private" },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#05060a]" onClick={handlePageClick}>
      {/* Click Spark Effects */}
      {clickSparks.map(spark => (
        <div
          key={spark.id}
          className="fixed pointer-events-none z-50"
          style={{ left: spark.x - 20, top: spark.y - 20 }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-spark"
              style={{ transform: `rotate(${i * 60}deg)`, animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      ))}

      {/* Roast Popup Easter Egg */}
      {showSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSecret(false)}>
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-8 py-8 rounded-3xl shadow-2xl border border-emerald-500/30 max-w-sm mx-4">
            {/* Fire decoration */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">🔥</div>

            {/* Countdown Timer */}
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
              {countdown}
            </div>

            {/* Content */}
            <div className="text-center pt-2">
              <div className="text-lg font-bold text-emerald-400 mb-3">Relyce AI says:</div>
              <div className="text-base text-gray-200 leading-relaxed mb-4">
                {currentRoast}
              </div>

              {/* Find others hint */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  ✨ You found me! Find <span className="text-emerald-400 font-bold">3 others</span> to get a surprise ✨
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 bg-emerald-500/10 blur-xl rounded-3xl"></div>
          </div>
        </div>
      )}

      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      {/* Gradient Overlay - Subtle */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#05060a] to-transparent" />
      </div>

      {/* Main Content - Positioned closer to header */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-25 pb-12 lg:pt-10 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-120px)]">

          {/* Left Side - Text Content (Shows FIRST on mobile) */}
          <div className="text-center lg:text-left order-1 lg:order-1">
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] cursor-pointer transition-all duration-300 ${showSecret ? 'scale-105' : ''}`}
              onClick={handleTitleClick}
            >
              Experience the Future of{" "}
              <span className="inline-block bg-gradient-to-r from-emerald-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-gradient-x drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                AI Conversation.
              </span>
            </h1>

            <p className="mt-6 text-lg lg:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Instant, intelligent, and seamless. Your personal assistant, evolved.
            </p>

            <div className="mt-8">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-full bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 transform transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              >
                Get Started Now
              </Link>
            </div>

            {/* Feature Cards with Easter Eggs */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl bg-emerald-900/20 border backdrop-blur-sm transition-all duration-300 cursor-pointer group ${featureEasterEggs[index] ? 'border-pink-400 scale-105 rotate-1' : 'border-emerald-500/20 hover:border-emerald-500/40'
                    }`}
                  onMouseEnter={() => handleFeatureHover(index)}
                  onMouseLeave={() => resetFeatureHover(index)}
                >
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 transition-all duration-300 ${featureEasterEggs[index] ? 'bg-pink-500/20 border-pink-400 rotate-12' : 'bg-emerald-500/10 border-emerald-500/30 group-hover:bg-emerald-500/20'
                    }`}>
                    <feature.icon className={`w-5 h-5 transition-all duration-300 ${featureEasterEggs[index] || 'text-emerald-400'}`} />
                  </div>
                  <p className="text-white font-semibold text-sm">{feature.title}</p>
                  <p className="text-white font-semibold text-sm">{feature.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Developed by Relyce Infotech - Easter Egg */}
            <div className="mt-8 flex justify-center lg:justify-center">
              <span className="developed-by-text text-[16px] text-gray-600 cursor-default select-none transition-all duration-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-emerald-400 hover:via-teal-300 hover:to-emerald-500 hover:scale-105 inline-block">
                Developed with 💚 by Relyce Infotech
              </span>
            </div>
          </div>

          {/* Right Side - Chat Interface Mockup (Shows SECOND on mobile) */}
          <div className="order-2 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm lg:max-w-md">
              {/* Curved Wave Effect - Hidden on mobile */}
              <div className="hidden lg:block absolute -right-32 -top-32 -bottom-32 w-[600px] pointer-events-none overflow-visible">
                <svg viewBox="0 0 400 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                  {/* Animated Wave Arc 1 - Outermost */}
                  <path
                    d="M 350 50 Q 450 300 350 550"
                    fill="none"
                    stroke="url(#waveGradient1)"
                    strokeWidth="1"
                    className="animate-wave-pulse"
                    style={{ animationDelay: '0s' }}
                  />
                  {/* Animated Wave Arc 2 */}
                  <path
                    d="M 300 80 Q 400 300 300 520"
                    fill="none"
                    stroke="url(#waveGradient2)"
                    strokeWidth="1.5"
                    className="animate-wave-pulse"
                    style={{ animationDelay: '0.3s' }}
                  />
                  {/* Animated Wave Arc 3 */}
                  <path
                    d="M 250 100 Q 350 300 250 500"
                    fill="none"
                    stroke="url(#waveGradient3)"
                    strokeWidth="2"
                    className="animate-wave-pulse"
                    style={{ animationDelay: '0.6s' }}
                  />
                  {/* Animated Wave Arc 4 - Main visible */}
                  <path
                    d="M 200 120 Q 300 300 200 480"
                    fill="none"
                    stroke="url(#waveGradient4)"
                    strokeWidth="2.5"
                    className="animate-wave-pulse"
                    style={{ animationDelay: '0.9s' }}
                  />
                  {/* Animated Wave Arc 5 - Innermost */}
                  <path
                    d="M 150 150 Q 250 300 150 450"
                    fill="none"
                    stroke="url(#waveGradient5)"
                    strokeWidth="2"
                    className="animate-wave-pulse"
                    style={{ animationDelay: '1.2s' }}
                  />
                  <defs>
                    <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                      <stop offset="30%" stopColor="#10b981" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#10b981" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                      <stop offset="25%" stopColor="#10b981" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                      <stop offset="75%" stopColor="#10b981" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                      <stop offset="20%" stopColor="#10b981" stopOpacity="0.7" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                      <stop offset="80%" stopColor="#10b981" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="waveGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                      <stop offset="15%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                      <stop offset="85%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="waveGradient5" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                      <stop offset="20%" stopColor="#10b981" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                      <stop offset="80%" stopColor="#10b981" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20 rounded-3xl blur-2xl" />

              {/* Chat Window */}
              <div className="relative rounded-2xl bg-[#0a0f0a]/80 border border-emerald-500/30 backdrop-blur-xl overflow-hidden shadow-2xl">
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b border-emerald-500/20 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-gray-400 text-sm">Relyce AI Assistant</span>
                </div>

                {/* Chat Messages */}
                <div className="p-4 sm:p-6 space-y-4 min-h-[200px] sm:min-h-[280px]">
                  {/* AI Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="bg-[#0f1a0f] border border-emerald-500/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
                      <p className="text-gray-200 text-sm">Hello! How can I help you today?</p>
                    </div>
                  </div>

                  {/* Typing Indicator - Smoother animation */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="bg-[#0f1a0f] border border-emerald-500/20 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDuration: '0.6s' }} />
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDuration: '0.6s', animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDuration: '0.6s', animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input with Typewriter */}
                <div className="p-3 sm:p-4 border-t border-emerald-500/20">
                  <div className="flex items-center gap-3 bg-[#0a0f0a] border border-emerald-500/20 rounded-xl px-4 py-3">
                    <div className="flex-1 text-gray-500 text-sm truncate">
                      {placeholderText}<span className="animate-pulse">|</span>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-400 transition-colors shrink-0">
                      <Send className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Star */}
      <div className="absolute bottom-8 right-8 z-10">
        <Sparkles className="w-6 h-6 text-gray-600 animate-pulse" />
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes wave-pulse {
          0% {
            opacity: 0.15;
            stroke-dashoffset: 0;
          }
          50% {
            opacity: 0.8;
            stroke-dashoffset: 20;
          }
          100% {
            opacity: 0.15;
            stroke-dashoffset: 40;
          }
        }
        .animate-wave-pulse {
          animation: wave-pulse 4s ease-in-out infinite;
          stroke-dasharray: 10 5;
        }
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .developed-by-text:hover {
          animation: emerald-glow 2s ease infinite;
        }
        @keyframes emerald-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(20, 184, 166, 0.8));
          }
        }
        @keyframes spark {
          0% {
            transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation, 0deg)) translateY(-30px) scale(0);
            opacity: 0;
          }
        }
        .animate-spark {
          animation: spark 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;