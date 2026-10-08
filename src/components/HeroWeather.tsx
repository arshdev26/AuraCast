import React from 'react';
import { CurrentWeatherData, LocationData, DailyForecastItem } from '../types/weather';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import { Wind, Droplets, Sun, CloudRain, ArrowUp, ArrowDown, Activity, RefreshCw } from 'lucide-react';

interface HeroWeatherProps {
  location: LocationData;
  current: CurrentWeatherData;
  todayDaily?: DailyForecastItem;
  unit: 'c' | 'f';
  poeticNote?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  exactPrecision?: boolean;
  onTogglePrecision?: () => void;
}

export const HeroWeather: React.FC<HeroWeatherProps> = ({
  location,
  current,
  todayDaily,
  unit,
  poeticNote,
  onRefresh,
  isRefreshing,
  exactPrecision = true,
  onTogglePrecision,
}) => {
  const toDisplayTemp = (tempC: number) => {
    const val = unit === 'f' ? (tempC * 9) / 5 + 32 : tempC;
    if (exactPrecision) {
      return val.toFixed(1);
    }
    return Math.round(val).toString();
  };

  const tempCurrent = toDisplayTemp(current.temperature);
  const tempFeels = toDisplayTemp(current.apparentTemperature);
  const tempMax = todayDaily ? toDisplayTemp(todayDaily.tempMax) : tempCurrent;
  const tempMin = todayDaily ? toDisplayTemp(todayDaily.tempMin) : tempCurrent;

  const targetTz = location.timezone || 'UTC';
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now);
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const windDisplay = unit === 'f'
    ? `${Math.round(current.windSpeed * 0.621371)} mph`
    : `${Math.round(current.windSpeed)} km/h`;

  const precipDisplay = unit === 'f'
    ? `${(current.precipitation * 0.0393701).toFixed(2)} in`
    : `${current.precipitation} mm`;

  const rawTempC = current.temperature;
  const rawTempF = (rawTempC * 9) / 5 + 32;

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT COLUMN: Location, Cursive Note, Massive Temp & Condition */}
          <div className="lg:col-span-7 space-y-4">
            {/* Location & Time metadata (Zero-pill discipline) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium">
                <span className="text-white font-semibold text-base sm:text-lg">
                  {location.name}
                </span>
                {location.admin1 && (
                  <>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span>{location.admin1}</span>
                  </>
                )}
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>{location.country}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="font-mono tabular-nums text-slate-400">
                  {formattedTime}
                </span>
                {location.elevation !== undefined && (
                  <>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="text-slate-400 text-xs font-mono">
                      {location.elevation}m ASL
                    </span>
                  </>
                )}
              </div>

              {/* Google Weather Verified Badge & Refresh */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-400/25 text-[11px] font-semibold text-sky-300">
                  <Activity className="w-3 h-3 text-sky-400" />
                  <span>Google Weather API</span>
                </span>

                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title="Fetch latest Google Weather atmospheric readings"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Playwrite Belgique Wallonie-Bruxelles Guides Cursive Accent Note */}
            <div className="py-1">
              <p className="font-script text-xl sm:text-2xl md:text-3xl text-amber-300 drop-shadow-sm tracking-wide leading-relaxed">
                {poeticNote || (
                  current.conditionCategory === 'sunny'
                    ? 'A charming sunny afternoon glowing warmly'
                    : current.conditionCategory === 'rainy'
                    ? 'Soft rhythmic raindrops gentle on the streets'
                    : 'A serene canopy of clouds across the sky'
                )}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {formattedDate} · High-Resolution NWP Atmospheric Model
              </p>
            </div>

            {/* Main Temperature Display */}
            <div className="flex flex-wrap items-baseline gap-4 pt-2">
              <div className="flex items-start">
                <span className="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter text-white font-sans tabular-nums drop-shadow-lg">
                  {tempCurrent}
                </span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-light text-amber-300 mt-2 ml-1">
                  °{unit.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm text-slate-300 border-l border-white/15 pl-4 py-1">
                <div className="font-medium">
                  Feels like{' '}
                  <span className="font-bold text-white tabular-nums">
                    {tempFeels}°
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="flex items-center gap-0.5 text-rose-300">
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span className="tabular-nums font-semibold">{tempMax}°</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-0.5 text-sky-300">
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span className="tabular-nums font-semibold">{tempMin}°</span>
                  </span>
                </div>

                {/* Precision Sensor Badge & Toggle */}
                <button
                  type="button"
                  onClick={onTogglePrecision}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
                  title="Toggle 0.1° precise sensor resolution"
                >
                  <span className="text-slate-400">Sensor:</span>
                  <span className="text-amber-300 font-semibold">
                    {unit === 'f' ? `${rawTempF.toFixed(1)}°F` : `${rawTempC.toFixed(1)}°C`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({exactPrecision ? '0.1°' : 'Round'})
                  </span>
                </button>
              </div>
            </div>

            {/* Condition description & quick stat ribbon */}
            <div className="pt-2">
              <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight flex items-center gap-3">
                <span>{current.conditionText}</span>
              </div>

              {/* Unboxed inline metadata row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300 mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span>Wind</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {windDisplay}
                  </span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>Humidity</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {current.humidity}%
                  </span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>UV Index</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {current.uvIndex}
                  </span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-indigo-400" />
                  <span>Precipitation</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {precipDisplay}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Large Centerpiece Animated Weather Icon & Atmospheric Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
              {/* Outer soft ambient backlight */}
              <div
                className={`absolute inset-0 rounded-full blur-3xl opacity-50 ${
                  current.conditionCategory === 'sunny'
                    ? 'bg-amber-400/60'
                    : current.conditionCategory === 'rainy'
                    ? 'bg-sky-600/40'
                    : 'bg-slate-400/30'
                }`}
              />
              <AnimatedWeatherIcon
                category={current.conditionCategory}
                isDay={current.isDay}
                size="xl"
                className="scale-125"
              />
            </div>
            <p className="text-xs text-slate-300 font-medium tracking-wide uppercase mt-2">
              Atmospheric status: {current.conditionCategory.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
