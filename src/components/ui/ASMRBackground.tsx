'use client';

import React, { useEffect, useRef } from 'react';

/**
 * ASMRStaticBackground Component
 */
const ASMRBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number;
        let height: number;
        let animationFrameId: number;
        let particles: Particle[] = [];
        const mouse = { x: -1000, y: -1000 };

        const PARTICLE_COUNT = 800; // Slightly reduced for performance
        const MAGNETIC_RADIUS = 280;
        const VORTEX_STRENGTH = 0.05;
        const PULL_STRENGTH = 0.08;

        class Particle {
            x: number = 0;
            y: number = 0;
            vx: number = 0;
            vy: number = 0;
            size: number = 0;
            alpha: number = 0;
            color: string = '';
            rotation: number = 0;
            rotationSpeed: number = 0;
            frictionGlow: number = 0;

            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.2 + 0.3;
                this.vx = (Math.random() - 0.5) * 0.1;
                this.vy = (Math.random() - 0.5) * 0.1;
                // 80% Charcoal, 20% Glass for a subtler feel
                const isGlass = Math.random() > 0.8;
                this.color = isGlass ? '240, 245, 255' : '60, 60, 65';
                this.alpha = Math.random() * 0.3 + 0.05;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            }

            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MAGNETIC_RADIUS) {
                    const force = (MAGNETIC_RADIUS - dist) / MAGNETIC_RADIUS;

                    this.vx += (dx / dist) * force * PULL_STRENGTH;
                    this.vy += (dy / dist) * force * PULL_STRENGTH;

                    this.vx += (dy / dist) * force * VORTEX_STRENGTH * 8;
                    this.vy -= (dx / dist) * force * VORTEX_STRENGTH * 8;

                    this.frictionGlow = force * 0.5;
                } else {
                    this.frictionGlow *= 0.95;
                }

                this.x += this.vx;
                this.y += this.vy;

                this.vx *= 0.97;
                this.vy *= 0.97;

                this.vx += (Math.random() - 0.5) * 0.02;
                this.vy += (Math.random() - 0.5) * 0.02;

                this.rotation += this.rotationSpeed + (Math.abs(this.vx) + Math.abs(this.vy)) * 0.03;

                if (this.x < -20) this.x = width + 20;
                if (this.x > width + 20) this.x = -20;
                if (this.y < -20) this.y = height + 20;
                if (this.y > height + 20) this.y = -20;
            }

            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                const finalAlpha = Math.min(this.alpha + this.frictionGlow, 0.7);
                ctx.fillStyle = `rgba(${this.color}, ${finalAlpha})`;

                if (this.frictionGlow > 0.2) {
                    ctx.shadowBlur = 10 * this.frictionGlow;
                    ctx.shadowColor = `rgba(160, 200, 255, ${this.frictionGlow * 0.5})`;
                }

                ctx.beginPath();
                ctx.moveTo(0, -this.size * 2);
                ctx.lineTo(this.size, 0);
                ctx.lineTo(0, this.size * 2);
                ctx.lineTo(-this.size, 0);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }
        }

        const init = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        };

        const render = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Darker baseline for better contrast
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
                document.documentElement.style.setProperty('--mouse-x', `${e.touches[0].clientX}px`);
                document.documentElement.style.setProperty('--mouse-y', `${e.touches[0].clientY}px`);
            }
        };

        window.addEventListener('resize', init);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        init();
        render();

        return () => {
            window.removeEventListener('resize', init);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-black">
            <canvas
                ref={canvasRef}
                className="block w-full h-full opacity-60"
            />

            {/* Subtle mouse glow */}
            <div
                className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none transition-transform duration-200 ease-out z-[1]"
                style={{
                    transform: `translate(calc(var(--mouse-x, -1000px) - 50%), calc(var(--mouse-y, -1000px) - 50%))`
                }}
            />
        </div>
    );
};

export default ASMRBackground;
