import React, { useRef, useEffect } from 'react';
// Remove the import since CyberpunkRain is now defined within this file
// import CyberpunkRain from '../CyberpunkRain.jsx';
import { UploadCloud, MessageCircle, Sparkles } from 'lucide-react';

// === Cyberpunk Rain Effect ===
const CyberpunkRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    let w = canvas.width;
    let h = canvas.height;
    let lines = [];
    let animationFrameId;

    const LINE_SPACING = 70;
    const DROP_COUNT = 6;
    const COLORS = [
      [0, 255, 180],
      [0, 200, 255],
      [0, 255, 100],
      [100, 255, 200],
      [255, 50, 150],
    ];

    const initLines = () => {
      lines = [];
      const numLines = Math.floor(w / LINE_SPACING);
      for (let i = 0; i < numLines; i++) {
        const depth = 0.4 + Math.random() * 0.6;
        const drops = [];
        for (let j = 0; j < DROP_COUNT; j++) {
          drops.push({
            y: Math.random() * h,
            speed: 1 + Math.random() * 4 * depth,
            height: 10 + Math.random() * 20,
            opacity: 0.3 + Math.random() * 0.7,
            tailLength: 15 + Math.random() * 25,
            swayOffset: Math.random() * 1000,
            swayAmplitude: 2 + Math.random() * 3,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: (Math.random() - 0.5) * 0.2,
            flickerPhase: Math.random() * Math.PI * 2,
            sparkTimer: 0,
          });
        }
        lines.push({
          x: i * LINE_SPACING + (Math.random() * 20 - 10),
          drops,
          depth,
          swayOffset: Math.random() * 50,
        });
      }
    };
    initLines();

    const animate = () => {
      const time = Date.now() * 0.002;
      ctx.fillStyle = "rgba(5,6,10,0.15)";
      ctx.fillRect(0, 0, w, h);

      if (canvas.width !== w || canvas.height !== h) {
        w = canvas.width;
        h = canvas.height;
        initLines();
      }

      for (let line of lines) {
        const lineSway = Math.sin(time + line.swayOffset) * 8 * line.depth;
        const lineAlpha = 0.15 + 0.25 * line.depth;

        ctx.fillStyle = `rgba(20,20,30,${lineAlpha})`;
        ctx.fillRect(line.x - 1.5 + lineSway, 0, 3, h);

        ctx.shadowBlur = 12 * line.depth;
        ctx.shadowColor = "#0f0";

        for (let drop of line.drops) {
          const dropSway = Math.sin(time * 1.5 + drop.swayOffset) * drop.swayAmplitude;
          const flicker = 0.4 + 0.6 * Math.sin(time * 6 + drop.flickerPhase);

          if (drop.sparkTimer > 0) drop.sparkTimer--;
          else if (Math.random() < 0.015) drop.sparkTimer = 3;

          const sparkMultiplier = drop.sparkTimer > 0 ? 2 : 1;
          const dropX = line.x + lineSway + dropSway;

          ctx.save();
          ctx.translate(dropX, drop.y);
          ctx.rotate(drop.rotation);

          const gradient = ctx.createLinearGradient(0, -drop.tailLength / 2, 0, drop.tailLength / 2);
          gradient.addColorStop(0, "rgba(0,0,0,0)");
          gradient.addColorStop(
            1,
            `rgba(${drop.color[0]},${drop.color[1]},${drop.color[2]},${
              drop.opacity * flicker * lineAlpha * sparkMultiplier
            })`
          );

          ctx.fillStyle = gradient;
          ctx.fillRect(-2, -drop.tailLength / 2, 4, drop.tailLength);
          ctx.restore();

          drop.y += drop.speed;
          if (drop.y - drop.tailLength / 2 > h) drop.y = -drop.tailLength / 2;
        }
        ctx.shadowBlur = 0;
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    />
  );
};

export default function HowItWorksSection() {
  
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Cyberpunk Rain Background */}
      <div className="absolute inset-0 -z-20">
        <CyberpunkRain />
      </div>

      {/* Themed Emerald Grid Lines */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div
          className="absolute inset-0 bg-[size:40px_40px] 
          bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),
          linear-gradient(to_bottom,#10b981_1px,transparent_1px)]"
        ></div>
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Get Started in 3 Simple Steps</h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-y-12 md:gap-x-8">
          {/* Dashed line for desktop */}
          <div className="absolute top-1/2 left-0 w-full h-px 
            bg-repeat-x bg-[length:16px_1px] bg-center 
            bg-[image:linear-gradient(to_right,rgb(16,185,129,0.3)_33%,rgba(255,255,255,0)_0%)] 
            hidden md:block"></div>
          
          {/* Step 1 */}
          <div className="relative text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full border-2 bg-[#0a0b10] border-emerald-500/50">
              <UploadCloud className="w-10 h-10 text-emerald-400" />
              <span className="absolute -top-3 -right-3 flex items-center justify-center w-8 h-8 font-bold bg-emerald-500 text-black rounded-full">1</span>
            </div>
            <h3 className="text-2xl font-semibold">Upload Your Data</h3>
            <p className="mt-3 text-gray-400">
              Securely provide your documents or connect your data source.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full border-2 bg-[#0a0b10] border-emerald-500/50">
              <MessageCircle className="w-10 h-10 text-emerald-400" />
              <span className="absolute -top-3 -right-3 flex items-center justify-center w-8 h-8 font-bold bg-emerald-500 text-black rounded-full">2</span>
            </div>
            <h3 className="text-2xl font-semibold">Ask a Question</h3>
            <p className="mt-3 text-gray-400">
              Interact in natural language. Ask complex questions, summarize, or extract information.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full border-2 bg-[#0a0b10] border-emerald-500/50">
              <Sparkles className="w-10 h-10 text-emerald-400" />
              <span className="absolute -top-3 -right-3 flex items-center justify-center w-8 h-8 font-bold bg-emerald-500 text-black rounded-full">3</span>
            </div>
            <h3 className="text-2xl font-semibold">Get Sourced Answers</h3>
            <p className="mt-3 text-gray-400">
              Receive an instant, accurate answer with direct links to the source.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}