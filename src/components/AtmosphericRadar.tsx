import React, { useState } from 'react';
import { LocationData, WeatherConditionCategory } from '../types/weather';
import { Layers, Play, Pause, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface AtmosphericRadarProps {
  location: LocationData;
  conditionCategory: WeatherConditionCategory;
  precipitation: number;
}

export const AtmosphericRadar: React.FC<AtmosphericRadarProps> = ({
  location,
  conditionCategory,
  precipitation,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [layerType, setLayerType] = useState<'clouds' | 'precipitation' | 'wind'>('precipitation');
  const [radarStep, setRadarStep] = useState(3);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Doppler Radar & Satellite Cloud Stream
            </h2>
            <p className="text-xs text-slate-400">
              High-resolution radar projection centered on {location.name} ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
            </p>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-xl border border-white/10">
            {(['precipitation', 'clouds', 'wind'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setLayerType(type)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                  layerType === type
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Radar Viewport Display */}
        <div className="relative w-full h-64 sm:h-80 rounded-2xl bg-slate-950/80 border border-white/10 overflow-hidden flex items-center justify-center">
          {/* Geographical Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35" />

          {/* Radar Sweep Ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-sky-500/20" />
            <div className="absolute w-96 h-96 rounded-full border border-sky-500/15" />
            <div className="absolute w-[540px] h-[540px] rounded-full border border-sky-500/10" />

            {/* Center target dot */}
            <div className="absolute w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/30 animate-pulse flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>

            {/* Sweep Angle Line */}
            {isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center origin-center animate-spin"
                style={{ animationDuration: '6s' }}
              >
                <div className="w-1/2 h-full bg-gradient-to-l from-emerald-500/15 to-transparent clip-path-radar pointer-events-none" />
              </div>
            )}
          </div>

          {/* Simulated Doppler Precipitation Blips / Clouds */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {layerType === 'precipitation' && (
              <>
                <div
                  className="absolute top-1/4 left-1/3 w-36 h-36 rounded-full blur-2xl opacity-60 bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-500"
                  style={{
                    transform: `translate(${Math.sin(radarStep) * 15}px, ${Math.cos(radarStep) * 10}px)`,
                  }}
                />
                <div className="absolute bottom-1/3 right-1/4 w-44 h-44 rounded-full blur-2xl opacity-40 bg-gradient-to-tr from-sky-400 via-emerald-400 to-transparent" />
              </>
            )}

            {layerType === 'clouds' && (
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-10 left-10 w-96 h-48 rounded-full bg-white/20 blur-3xl animate-cloud-slow" />
                <div className="absolute bottom-10 right-10 w-96 h-48 rounded-full bg-white/25 blur-3xl animate-cloud-fast" />
              </div>
            )}

            {layerType === 'wind' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400/20 via-transparent to-transparent animate-pulse" />
              </div>
            )}
          </div>

          {/* Overlay Coordinates & Status HUD */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
            <span className="text-amber-400 font-semibold">{location.name} RADAR</span>
            <span className="mx-2 text-slate-600">|</span>
            <span>ECHO: {conditionCategory.toUpperCase()}</span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 text-white hover:text-amber-400 transition-colors"
                title={isPlaying ? 'Pause radar loop' : 'Play radar loop'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <span className="font-mono text-[11px] text-slate-300">
                Loop: -45m · Now · +30m
              </span>
            </div>

            {/* Radar intensity legend */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px]">
              <span className="text-slate-400">Rain Intensity:</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-sky-400" title="Light" />
                <span className="w-3 h-2 rounded-sm bg-emerald-400" title="Moderate" />
                <span className="w-3 h-2 rounded-sm bg-yellow-400" title="Heavy" />
                <span className="w-3 h-2 rounded-sm bg-rose-500" title="Severe" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
