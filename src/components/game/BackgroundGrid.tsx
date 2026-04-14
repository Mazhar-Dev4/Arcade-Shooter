import React, { useEffect, useRef } from 'react';

export const BackgroundGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame = 0;
    const stars: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; depth: number }[] = [];
    const dust: { x: number; y: number; radius: number; alpha: number; phase: number; speed: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.08,
        vy: 0.04 + Math.random() * 0.18,
        size: Math.random() * 2.4 + 0.4,
        alpha: Math.random() * 0.45 + 0.08,
        depth: Math.random() * 0.8 + 0.2,
      });
    }

    for (let i = 0; i < 18; i++) {
      dust.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 70 + Math.random() * 160,
        alpha: Math.random() * 0.08 + 0.02,
        phase: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.18,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      baseGradient.addColorStop(0, 'hsla(230, 40%, 7%, 1)');
      baseGradient.addColorStop(0.45, 'hsla(230, 34%, 6%, 1)');
      baseGradient.addColorStop(1, 'hsla(236, 42%, 4%, 1)');
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.00018;

      const coreGlow = ctx.createRadialGradient(canvas.width * 0.52, canvas.height * 0.46, 20, canvas.width * 0.52, canvas.height * 0.46, canvas.width * 0.6);
      coreGlow.addColorStop(0, 'hsla(199, 89%, 48%, 0.16)');
      coreGlow.addColorStop(0.45, 'hsla(270, 80%, 60%, 0.08)');
      coreGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      dust.forEach((cloud, index) => {
        const x = cloud.x + Math.sin(time * cloud.speed + cloud.phase) * 40;
        const y = cloud.y + Math.cos(time * cloud.speed * 1.3 + cloud.phase) * 28;
        const nebula = ctx.createRadialGradient(x, y, 0, x, y, cloud.radius);
        nebula.addColorStop(0, index % 3 === 0 ? `hsla(199, 89%, 48%, ${cloud.alpha})` : index % 3 === 1 ? `hsla(270, 80%, 60%, ${cloud.alpha})` : `hsla(330, 85%, 60%, ${cloud.alpha})`);
        nebula.addColorStop(1, 'transparent');
        ctx.fillStyle = nebula;
        ctx.beginPath();
        ctx.arc(x, y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      const planetX = canvas.width * 0.82;
      const planetY = canvas.height * 0.2;
      const planetGradient = ctx.createRadialGradient(planetX - 20, planetY - 20, 8, planetX, planetY, 90);
      planetGradient.addColorStop(0, 'hsla(210, 30%, 90%, 0.28)');
      planetGradient.addColorStop(0.25, 'hsla(270, 80%, 60%, 0.18)');
      planetGradient.addColorStop(1, 'hsla(230, 35%, 16%, 0.02)');
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(planetX, planetY, 72, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'hsla(199, 89%, 48%, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(planetX, planetY + 4, 98, 24, Math.PI / 12, 0, Math.PI * 2);
      ctx.stroke();

      for (const p of stars) {
        p.x += p.vx;
        p.y += p.vy * p.depth;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.depth, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${190 + p.depth * 40}, 85%, 82%, ${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < 3; i++) {
        const streakY = (Math.sin(time * 0.9 + i * 2.3) * 0.5 + 0.5) * canvas.height;
        const gradient = ctx.createLinearGradient(0, streakY, canvas.width, streakY + 50);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.3 + Math.sin(time + i) * 0.2, `hsla(${i === 1 ? 270 : 199}, 89%, 58%, 0.03)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, streakY - 26, canvas.width, 52);
      }

      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,hsl(var(--foreground)/0.05),transparent_18%,transparent_100%)]" />
      <div className="absolute left-[10%] top-[18%] h-72 w-72 rounded-full bg-secondary/10 blur-[140px]" />
      <div className="absolute right-[12%] top-[12%] h-64 w-64 rounded-full bg-primary/10 blur-[140px]" />
      <div className="absolute bottom-[8%] left-[38%] h-80 w-80 rounded-full bg-accent/10 blur-[160px]" />
    </div>
  );
};
