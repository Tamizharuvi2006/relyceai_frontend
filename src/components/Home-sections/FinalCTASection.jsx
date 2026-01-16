// src/components/sections/FinalCTASection.jsx
import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bot, Users } from "lucide-react";

// === Cyberpunk Rain Effect (inline) ===
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
          const dropSway =
            Math.sin(time * 1.5 + drop.swayOffset) * drop.swayAmplitude;
          const flicker =
            0.4 + 0.6 * Math.sin(time * 6 + drop.flickerPhase);

          if (drop.sparkTimer > 0) drop.sparkTimer--;
          else if (Math.random() < 0.015) drop.sparkTimer = 3;

          const sparkMultiplier = drop.sparkTimer > 0 ? 2 : 1;
          const dropX = line.x + lineSway + dropSway;

          ctx.save();
          ctx.translate(dropX, drop.y);
          ctx.rotate(drop.rotation);

          const gradient = ctx.createLinearGradient(
            0,
            -drop.tailLength / 2,
            0,
            drop.tailLength / 2
          );
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
          if (drop.y - drop.tailLength / 2 > h)
            drop.y = -drop.tailLength / 2;
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

// === Final CTA Section ===
export default function FinalCTASection() {

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Cyberpunk Rain Background */}
      <CyberpunkRain />

      <div className="w-full max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <Users className="mx-auto w-10 h-10 text-emerald-400 mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Revolutionize Your Workflow?
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-gray-400">
          Stop wasting time sifting through endless documents. Let Relyce AI be
          your expert assistant and get the answers you need, when you need
          them.
        </p>
        <div className="mt-10">
          <Link
            to="/chat"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400/80 text-black font-semibold rounded-xl shadow-lg hover:scale-105 transform transition duration-300"
          >
            <Bot className="inline-block mr-2" size={22} /> Start Chatting for
            Free
          </Link>
        </div>
      </div>
    </section>
  );
}