import React, { useEffect, useRef } from 'react';
import { WeatherConditionCategory } from '../types/weather';

interface WeatherAtmosphereProps {
  category: WeatherConditionCategory;
  isDay: boolean;
  windSpeed?: number;
  precipitation?: number;
  isLoaded?: boolean;
}

export const WeatherAtmosphere: React.FC<WeatherAtmosphereProps> = ({
  category,
  isDay,
  windSpeed = 12,
  precipitation = 0,
  isLoaded = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // RAIN PARTICLES & SPLASHES
    interface Drop {
      x: number;
      y: number;
      len: number;
      speed: number;
      opacity: number;
    }
    interface Splash {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }

    const dropCount = category === 'thunderstorm' ? 320 : category === 'rainy' ? 180 : 0;
    const drops: Drop[] = [];
    const splashes: Splash[] = [];

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 14 + Math.random() * 22,
        speed: 16 + Math.random() * 14,
        opacity: 0.25 + Math.random() * 0.45,
      });
    }

    // SUN PARTICLES (warm golden motes / sun dust floating in lightbeams)
    interface SunParticle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      baseAlpha: number;
    }

    const sunParticleCount = category === 'sunny' ? 65 : 0;
    const sunParticles: SunParticle[] = [];
    for (let i = 0; i < sunParticleCount; i++) {
      sunParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.45,
        alpha: Math.random() * 0.6,
        baseAlpha: 0.2 + Math.random() * 0.5,
      });
    }

    // SNOW PARTICLES
    interface Snowflake {
      x: number;
      y: number;
      radius: number;
      vy: number;
      wobble: number;
      wobbleSpeed: number;
      alpha: number;
    }
    const snowCount = category === 'snowy' ? 120 : 0;
    const snowflakes: Snowflake[] = [];
    for (let i = 0; i < snowCount; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 3,
        vy: 0.8 + Math.random() * 1.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        alpha: 0.4 + Math.random() * 0.5,
      });
    }

    // STARS FOR CLEAR NIGHT
    interface Star {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
    }
    const starCount = category === 'clear_night' || (!isDay && category !== 'rainy') ? 85 : 0;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.75,
        radius: 0.6 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.8,
        speed: 0.01 + Math.random() * 0.02,
      });
    }

    let lightningTimer = 0;
    let lightningFlash = 0;

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.016;

      // 1. RAIN ANIMATION
      if (category === 'rainy' || category === 'thunderstorm') {
        // Wind slant angle
        const slant = (windSpeed / 18) * 4;

        ctx.strokeStyle = 'rgba(215, 235, 255, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + slant, d.y + d.len);

          d.y += d.speed;
          d.x += slant * 0.6;

          // Ground hit -> trigger splash ripple
          if (d.y > height - 10) {
            if (splashes.length < 40 && Math.random() > 0.6) {
              splashes.push({
                x: d.x,
                y: height - 10 + Math.random() * 8,
                radius: 1,
                maxRadius: 6 + Math.random() * 8,
                opacity: 0.5,
              });
            }
            d.y = -d.len;
            d.x = Math.random() * (width + 100) - 50;
          }
        }
        ctx.stroke();

        // Render Splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 1.8, s.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220, 240, 255, ${s.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          s.radius += 0.7;
          s.opacity -= 0.035;

          if (s.opacity <= 0) {
            splashes.splice(i, 1);
          }
        }

        // Thunderstorm lightning flashes
        if (category === 'thunderstorm') {
          lightningTimer++;
          if (lightningTimer > 280 && Math.random() < 0.03) {
            lightningFlash = 0.6 + Math.random() * 0.35;
            lightningTimer = 0;
          }

          if (lightningFlash > 0) {
            ctx.fillStyle = `rgba(240, 245, 255, ${lightningFlash})`;
            ctx.fillRect(0, 0, width, height);
            lightningFlash -= 0.08;
          }
        }
      }

      // 2. SUNNY CHARMING DUST & CREPUSCULAR SHIMMER
      if (category === 'sunny') {
        for (let i = 0; i < sunParticles.length; i++) {
          const p = sunParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha = p.baseAlpha + Math.sin(time * 2 + i) * 0.2;

          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
          grad.addColorStop(0, `rgba(255, 248, 220, ${Math.max(0, p.alpha)})`);
          grad.addColorStop(1, 'rgba(255, 215, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. SNOWFLAKES
      if (category === 'snowy') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < snowflakes.length; i++) {
          const flake = snowflakes[i];
          flake.wobble += flake.wobbleSpeed;
          flake.y += flake.vy;
          flake.x += Math.sin(flake.wobble) * 0.8;

          if (flake.y > height) {
            flake.y = -10;
            flake.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. NIGHT STARS TWINKLE
      if (starCount > 0) {
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          const twinkle = star.alpha + Math.sin(time * 3 + i * 5) * 0.3;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, twinkle))})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [category, isDay, windSpeed, precipitation, isLoaded]);

  // CSS Atmospheric theme styling
  const getAtmosphericGradients = () => {
    if (!isDay && category !== 'rainy' && category !== 'thunderstorm') {
      // Clear or cloudy night
      return 'from-slate-950 via-indigo-950 to-slate-900';
    }

    switch (category) {
      case 'sunny':
        // Sunny & Charming: Radiant amber gold & azure blue gradient with warm glowing sun aura
        return 'from-sky-400 via-amber-200/90 to-amber-500/80';
      case 'rainy':
        // Rainy: Dramatic mood, deep oceanic slate-blue to charcoal storm
        return 'from-slate-900 via-sky-950 to-slate-900';
      case 'thunderstorm':
        return 'from-slate-950 via-slate-900 to-indigo-950';
      case 'snowy':
        return 'from-slate-800 via-sky-900 to-slate-900';
      case 'foggy':
        return 'from-slate-800 via-slate-700 to-slate-800';
      case 'cloudy':
      default:
        // Default cloudy: Layered soft cool grey-slate & muted celestial azure
        return 'from-slate-800 via-slate-700/90 to-slate-900';
    }
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none transition-all duration-1000 ${
        isLoaded ? `bg-gradient-to-b ${getAtmosphericGradients()}` : 'default-app-gradient'
      } overflow-hidden z-0`}
      style={
        !isLoaded
          ? {
              backgroundColor: '#91cde6',
              backgroundImage:
                'linear-gradient(90deg, rgba(145, 205, 230, 1) 0%, rgba(141, 227, 177, 1) 50%, rgba(230, 218, 117, 1) 100%)',
            }
          : undefined
      }
      aria-hidden="true"
    >
      {isLoaded && (
        <>
          {/* SUNNY RADIANT SUN EFFECT */}
          {category === 'sunny' && isDay && (
            <div className="absolute -top-24 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none">
              {/* Intense sun core */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 via-amber-300 to-amber-500 blur-2xl opacity-75 animate-sun-glow" />
              <div className="absolute inset-16 rounded-full bg-amber-200/50 blur-3xl" />
              {/* Rotating crepuscular sun rays */}
              <div
                className="absolute inset-[-100px] opacity-35 animate-spin pointer-events-none"
                style={{
                  animationDuration: '90s',
                  background:
                    'conic-gradient(from 0deg, transparent 0deg 20deg, rgba(255, 235, 150, 0.3) 25deg 35deg, transparent 40deg 60deg, rgba(255, 245, 180, 0.35) 65deg 75deg, transparent 80deg 110deg, rgba(255, 230, 140, 0.3) 115deg 125deg, transparent 130deg 180deg, rgba(255, 240, 160, 0.25) 185deg 200deg, transparent 205deg 270deg, rgba(255, 235, 150, 0.3) 275deg 290deg, transparent 295deg 360deg)',
                }}
              />
            </div>
          )}

          {/* CLOUDY / OVERCAST VOLUMETRIC DRIFTING CLOUDS */}
          {(category === 'cloudy' ||
            category === 'foggy' ||
            category === 'rainy' ||
            category === 'thunderstorm') && (
            <div className="absolute inset-0 opacity-45 pointer-events-none">
              {/* Top Slow Drift Cloud Mass */}
              <div className="absolute -top-32 -left-48 w-[140%] h-[380px] rounded-[100%] bg-gradient-to-b from-slate-400/40 via-slate-500/30 to-transparent blur-3xl animate-cloud-slow" />
              {/* Mid Layer Fast Cloud Mass */}
              <div className="absolute top-20 -right-40 w-[120%] h-[320px] rounded-[100%] bg-gradient-to-b from-slate-300/35 via-slate-400/20 to-transparent blur-3xl animate-cloud-fast" />
              {/* Bottom horizon mist wisp */}
              <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-900/60 to-transparent blur-xl" />
            </div>
          )}

          {/* CLEAR NIGHT LUNAR CRESCENT */}
          {!isDay && (category === 'clear_night' || category === 'sunny') && (
            <div className="absolute top-16 right-24 w-28 h-28 rounded-full pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-slate-100 shadow-[0_0_60px_rgba(255,255,255,0.45)]" />
              <div className="absolute top-1 left-4 w-22 h-22 rounded-full bg-slate-950 opacity-90" />
            </div>
          )}

          {/* DYNAMIC CANVAS PARTICLE SYSTEM (Rain, Splashes, Snow, Sun Dust) */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Subtle depth vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/35 pointer-events-none" />
        </>
      )}
    </div>
  );
};
