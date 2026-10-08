import React from 'react';
import {
  CurrentWeatherData,
  AirQualityData,
  SolarData,
} from '../types/weather';
import {
  Wind,
  Sun,
  ShieldAlert,
  Droplets,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Clock,
} from 'lucide-react';

interface TelemetryGridProps {
  current: CurrentWeatherData;
  airQuality: AirQualityData;
  solar: SolarData;
  unit: 'c' | 'f';
  timezone?: string;
  exactPrecision?: boolean;
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({
  current,
  airQuality,
  solar,
  unit,
  timezone,
  exactPrecision = true,
}) => {
  // UV Level Category
  const getUvLevel = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-400', bar: 'bg-emerald-400' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-amber-400', bar: 'bg-amber-400' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-400', bar: 'bg-orange-400' };
    if (uv <= 10) return { text: 'Very High', color: 'text-rose-400', bar: 'bg-rose-400' };
    return { text: 'Extreme', color: 'text-purple-400', bar: 'bg-purple-400' };
  };

  const uvInfo = getUvLevel(current.uvIndex);

  // Format sunrise / sunset in true location timezone
  const effectiveTz = timezone || solar.timezone || 'UTC';
  const formatSunTime = (isoString: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: effectiveTz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const dewPointDisplay = unit === 'f'
    ? (exactPrecision ? ((current.dewPoint * 9) / 5 + 32).toFixed(1) : Math.round((current.dewPoint * 9) / 5 + 32))
    : (exactPrecision ? current.dewPoint.toFixed(1) : Math.round(current.dewPoint));

  const windSpeedDisplay = unit === 'f'
    ? (exactPrecision ? (current.windSpeed * 0.621371).toFixed(1) : Math.round(current.windSpeed * 0.621371))
    : (exactPrecision ? current.windSpeed.toFixed(1) : Math.round(current.windSpeed));

  const windGustsDisplay = unit === 'f'
    ? (exactPrecision ? (current.windGusts * 0.621371).toFixed(1) : Math.round(current.windGusts * 0.621371))
    : (exactPrecision ? current.windGusts.toFixed(1) : Math.round(current.windGusts));

  const windUnit = unit === 'f' ? 'mph' : 'km/h';

  const pressureDisplay = unit === 'f'
    ? (current.pressure * 0.02953).toFixed(2)
    : current.pressure;

  const pressureUnit = unit === 'f' ? 'inHg' : 'hPa';

  const visibilityDisplay = unit === 'f'
    ? (exactPrecision ? (current.visibility * 0.621371).toFixed(1) : Math.round(current.visibility * 0.621371))
    : (exactPrecision ? current.visibility.toFixed(1) : current.visibility);

  const visibilityUnit = unit === 'f' ? 'mi' : 'km';

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1: WIND & GUSTS (With Compass Dial) */}
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-400" />
              Wind Dynamics
            </span>
            <span className="text-xs font-mono text-slate-400">
              {current.windDirection}° Azimuth
            </span>
          </div>

          <div className="flex items-center justify-between my-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold font-sans text-white tabular-nums">
                  {windSpeedDisplay}
                </span>
                <span className="text-xs font-mono text-slate-400">{windUnit}</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Gusts up to{' '}
                <span className="font-mono font-semibold text-white">
                  {windGustsDisplay} {windUnit}
                </span>
              </div>
            </div>

            {/* Compass visual needle */}
            <div className="relative w-18 h-18 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
              <span className="absolute top-1 text-[9px] font-mono text-slate-400">N</span>
              <span className="absolute bottom-1 text-[9px] font-mono text-slate-400">S</span>
              <span className="absolute left-1 text-[9px] font-mono text-slate-400">W</span>
              <span className="absolute right-1 text-[9px] font-mono text-slate-400">E</span>
              <div
                className="w-8 h-8 flex items-center justify-center transition-transform duration-700"
                style={{ transform: `rotate(${current.windDirection}deg)` }}
              >
                <div className="w-0.5 h-6 bg-gradient-to-t from-transparent via-amber-400 to-rose-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5">
            Surface airflow: {current.windSpeed > 25 ? 'Brisk & gusty' : 'Gentle ambient drift'}
          </div>
        </div>

        {/* CARD 2: UV RADIATION INDEX */}
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              UV Radiation
            </span>
            <span className={`text-xs font-semibold ${uvInfo.color}`}>
              {uvInfo.text}
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold font-sans text-white tabular-nums">
                {current.uvIndex}
              </span>
              <span className="text-xs font-mono text-slate-400">Index</span>
            </div>

            {/* Progress gauge bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${uvInfo.bar}`}
                style={{ width: `${Math.min(100, (current.uvIndex / 11) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5">
            {current.uvIndex > 5
              ? 'High sun intensity; SPF 30+ and UV sunglasses recommended.'
              : 'Low risk; minimal sun protection required today.'}
          </div>
        </div>

        {/* CARD 3: AIR QUALITY INDEX (AQI) */}
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Air Quality
            </span>
            <span className="text-xs font-semibold text-emerald-300">
              {airQuality.category}
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-sans text-white tabular-nums">
                {airQuality.usAqi}
              </span>
              <span className="text-xs font-mono text-slate-400">US AQI</span>
              <span className="text-xs text-slate-500 font-mono">
                · {airQuality.europeanAqi} EU
              </span>
            </div>

            {/* Pollutant readings */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-300">
              <div>
                PM2.5:{' '}
                <span className="font-mono font-semibold text-white">
                  {airQuality.pm25} µg/m³
                </span>
              </div>
              <div>
                PM10:{' '}
                <span className="font-mono font-semibold text-white">
                  {airQuality.pm10} µg/m³
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5">
            Clean atmospheric purity; ideal for outdoor respiration.
          </div>
        </div>

        {/* CARD 4: HUMIDITY & DEW POINT */}
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Moisture & Humidity
            </span>
            <span className="text-xs font-mono text-slate-400">
              Dew {dewPointDisplay}°
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold font-sans text-white tabular-nums">
                {current.humidity}
              </span>
              <span className="text-xs font-mono text-slate-400">%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
                style={{ width: `${current.humidity}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5">
            Dew point is {dewPointDisplay}° · {current.humidity > 70 ? 'Humid air' : 'Comfortable dry air'}
          </div>
        </div>

        {/* CARD 5: PRESSURE & VISIBILITY */}
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-400" />
              Barometer & Sight
            </span>
            <span className="text-xs font-mono text-slate-400">Steady</span>
          </div>

          <div className="my-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] text-slate-400">Pressure</div>
              <div className="text-2xl font-bold font-sans text-white tabular-nums">
                {pressureDisplay}
              </div>
              <div className="text-[10px] font-mono text-slate-400">{pressureUnit}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Visibility
              </div>
              <div className="text-2xl font-bold font-sans text-white tabular-nums">
                {visibilityDisplay}
              </div>
              <div className="text-[10px] font-mono text-slate-400">{visibilityUnit}</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5">
            Cloud canopy cover: {current.cloudCover}%
          </div>
        </div>

        {/* CARD 6: SOLAR CYCLE & SUNRISE/SUNSET */}
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              Solar Trajectory
            </span>
            <span className="text-xs font-mono text-slate-400">
              {solar.daylightDurationHours}h daylight
            </span>
          </div>

          <div className="my-4 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <Sunrise className="w-6 h-6 text-amber-300 mb-1" />
              <span className="text-[10px] text-slate-400">Sunrise</span>
              <span className="text-sm font-semibold font-mono text-white">
                {formatSunTime(solar.sunrise)}
              </span>
            </div>

            {/* Sun arc SVG */}
            <div className="w-20 h-10 border-t-2 border-dashed border-amber-400/40 rounded-t-full flex items-end justify-center pb-1">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>

            <div className="flex flex-col items-center">
              <Sunset className="w-6 h-6 text-rose-400 mb-1" />
              <span className="text-[10px] text-slate-400">Sunset</span>
              <span className="text-sm font-semibold font-mono text-white">
                {formatSunTime(solar.sunset)}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5">
            Dusk brings serene twilight and cooler breezes.
          </div>
        </div>
      </div>
    </section>
  );
};
