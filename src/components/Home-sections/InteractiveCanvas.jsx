import React, { useRef, useEffect, useState } from 'react';

const InteractiveCanvas = ({
    glowColor = 'rgba(16, 185, 129, 0.2)', // Emerald default
    particleColor = 'rgba(16, 185, 129, 0.8)',
    lineColor = 'rgba(16, 185, 129, 0.4)',
    coreScale = 'scale-100',
    className = ''
}) => {
    const canvasRef = useRef(null);
    const [mouse, setMouse] = useState({ x: -1000, y: -1000 });
    const particlesRef = useRef([]);

    // Configuration
    const config = {
        particleCount: 60,
        connectionDistance: 120,
        mouseRepelDistance: 150,
        baseSpeed: 0.5,
        particleSize: 1.5,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width = 0;
        let height = 0;

        // Resize handler
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                width = parent.clientWidth;
                height = parent.clientHeight;
                // High DPI display support
                const dpr = window.devicePixelRatio || 1;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
            }
            initParticles();
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * config.baseSpeed;
                this.vy = (Math.random() - 0.5) * config.baseSpeed;
                this.radius = Math.random() * config.particleSize + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                
                // For a slight trailing/organic effect
                this.targetX = this.x;
                this.targetY = this.y;
            }

            update(mouseX, mouseY) {
                // Base movement
                this.targetX += this.vx;
                this.targetY += this.vy;

                // Bounce off edges smoothly
                if (this.targetX < 0 || this.targetX > width) this.vx *= -1;
                if (this.targetY < 0 || this.targetY > height) this.vy *= -1;

                // Mouse interaction (Repel)
                const dx = mouseX - this.targetX;
                const dy = mouseY - this.targetY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRepelDistance) {
                    const force = (config.mouseRepelDistance - distance) / config.mouseRepelDistance;
                    const pushX = (dx / distance) * force * 5;
                    const pushY = (dy / distance) * force * 5;
                    
                    this.targetX -= pushX;
                    this.targetY -= pushY;
                }

                // Smooth interpolation towards target (easing)
                this.x += (this.targetX - this.x) * 0.1;
                this.y += (this.targetY - this.y) * 0.1;
                
                // boundary failsafe after easing
                if (this.x < -50) { this.x = width + 50; this.targetX = this.x; }
                if (this.x > width + 50) { this.x = -50; this.targetX = this.x; }
                if (this.y < -50) { this.y = height + 50; this.targetY = this.y; }
                if (this.y > height + 50) { this.y = -50; this.targetY = this.y; }

            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
            }
        }

        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < config.particleCount; i++) {
                particlesRef.current.push(new Particle());
            }
        };

        const drawConnections = () => {
            const particles = particlesRef.current;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = 1 - (distance / config.connectionDistance);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        
                        // Extract rgb from rgba string to animate opacity correctly
                        // Assuming lineColor is defined like 'rgba(16, 185, 129, 0.4)'
                        const colorMatch = lineColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                        if(colorMatch) {
                            ctx.strokeStyle = `rgba(${colorMatch[1]}, ${colorMatch[2]}, ${colorMatch[3]}, ${opacity * 0.5})`;
                        } else {
                            // Fallback if lineColor format is weird
                            ctx.strokeStyle = lineColor;
                            ctx.globalAlpha = opacity * 0.5;
                        }
                        
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.globalAlpha = 1.0; // reset
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw a subtle background glow tracking the mouse slightly
            if(mouse.x > 0 && mouse.y > 0) {
                 const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
                 
                 const colorMatch = glowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                 if(colorMatch) {
                     const alpha = parseFloat(colorMatch[4] || '0.2') * 0.5;
                     gradient.addColorStop(0, `rgba(${colorMatch[1]}, ${colorMatch[2]}, ${colorMatch[3]}, ${alpha})`);
                     gradient.addColorStop(1, 'rgba(0,0,0,0)');
                     ctx.fillStyle = gradient;
                     ctx.fillRect(0,0,width,height);
                 }
            }

            const particles = particlesRef.current;
            for (let p of particles) {
                p.update(mouse.x, mouse.y);
                p.draw();
            }
            
            drawConnections();

            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize
        resize();
        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mouse.x, mouse.y, glowColor, particleColor, lineColor]);

    // Handle mouse movement over the container
    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        setMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseLeave = () => {
        setMouse({ x: -1000, y: -1000 });
    };

    return (
        <div 
            className={`relative w-full h-full flex items-center justify-center ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* The interactive WebGL/Canvas layer */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full z-10 block"
                style={{ pointerEvents: 'none' }} // Let container handle events
            />
            
            {/* The central structural/glowing elements from the original design */}
            <div className={`absolute inset-0 transition-opacity duration-1000 mix-blend-screen ${glowColor}`} style={{ background: glowColor, filter: 'blur(100px)', opacity: 0.3 }} />
            
            <div className="relative w-full h-full flex items-center justify-center z-0 pointer-events-none opacity-20 px-8 py-8">
                 {/* Inner core node - keeping the scaling effect from original design */}
                 <div className={`w-12 h-12 rounded-full border border-emerald-500/50 bg-emerald-500/10 transition-transform duration-[2000ms] ease-out ${coreScale} shadow-[0_0_30px_rgba(16,185,129,0.5)]`} />
            </div>
            
            {/* Geometric border rings for structure */}
            <div className="absolute w-[85%] h-[85%] rounded-[40px] border-[0.5px] border-emerald-500/10 z-0 pointer-events-none transition-all duration-[2000ms]" style={{ transform: coreScale === 'scale-125' ? 'rotate(15deg)' : 'rotate(0deg)' }} />
            <div className="absolute w-[65%] h-[65%] rounded-full border-[0.5px] border-dashed border-emerald-500/20 z-0 pointer-events-none transition-all duration-[3000ms]" style={{ transform: coreScale === 'scale-75' ? 'rotate(-45deg)' : 'rotate(0deg)' }} />

        </div>
    );
};

export default InteractiveCanvas;
