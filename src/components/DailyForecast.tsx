import React from 'react';
import { DailyForecastItem } from '../types/weather';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import { Droplets, Wind, Sun } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  unit: 'c' | 'f';
  exactPrecision?: boolean;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit, exactPrecision = true }) => {
  const toDisplayTemp = (tempC: number) => {
    const val = unit === 'f' ? (tempC * 9) / 5 + 32 : tempC;
    if (exactPrecision) {
      return val.toFixed(1);
    }
    return Math.round(val).toString();
  };

  // Find min and max across all 7 days for relative bar alignment
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const rangeSpan = Math.max(1, globalMax - globalMin);

  return (
    <section className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 sm:p-6 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {daily.length}-Day Forecast
            </h2>
            <p className="text-xs text-slate-400">
              Extended meteorological horizon & thermal spectrum
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {daily.map((day, idx) => {
            const minTemp = toDisplayTemp(day.tempMin);
            const maxTemp = toDisplayTemp(day.tempMax);

            // Calculate percentage positions for thermal range bar
            const leftPct = ((day.tempMin - globalMin) / rangeSpan) * 100;
            const rightPct = ((globalMax - day.tempMax) / rangeSpan) * 100;

            const isToday = idx === 0;

            return (
              <div
                key={day.date}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl border transition-colors ${
                  isToday
                    ? 'bg-amber-400/10 border-amber-300/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/5'
                }`}
              >
                {/* Day Name & Condition */}
                <div className="flex items-center gap-3 w-44">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                    <AnimatedWeatherIcon
                      category={day.conditionCategory}
                      isDay={true}
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {day.dayName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      {day.conditionText}
                    </div>
                  </div>
                </div>

                {/* Rain probability */}
                <div className="flex items-center gap-1 w-20 text-xs text-sky-300 shrink-0">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-mono tabular-nums">
                    {day.precipitationProbability}%
                  </span>
                </div>

                {/* Min & Max Thermal Range Bar */}
                <div className="flex items-center gap-2.5 flex-1 min-w-[160px]">
                  <span className="text-xs font-mono tabular-nums text-slate-300 w-12 text-right shrink-0">
                    {minTemp}°
                  </span>

                  {/* Horizontal Bar */}
                  <div className="flex-1 h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400"
                      style={{
                        left: `${Math.max(0, leftPct)}%`,
                        right: `${Math.max(0, rightPct)}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono font-bold tabular-nums text-white w-12 shrink-0">
                    {maxTemp}°
                  </span>
                </div>

                {/* Sun & Wind quick specs */}
                <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400 shrink-0 w-28 justify-end">
                  <span className="flex items-center gap-1" title="Max UV Index">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span className="font-mono tabular-nums">{day.uvIndexMax}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Max Wind Speed">
                    <Wind className="w-3 h-3 text-slate-400" />
                    <span className="font-mono tabular-nums">
                      {unit === 'f'
                        ? `${Math.round(day.windSpeedMax * 0.621371)} mph`
                        : `${day.windSpeedMax} km/h`}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
