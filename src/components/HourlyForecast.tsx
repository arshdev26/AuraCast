import React, { useRef } from 'react';
import { HourlyForecastItem } from '../types/weather';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import { ChevronLeft, ChevronRight, Droplets, Wind } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  unit: 'c' | 'f';
  timezone?: string;
  exactPrecision?: boolean;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  unit,
  timezone,
  exactPrecision = true,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const toDisplayTemp = (tempC: number) => {
    const val = unit === 'f' ? (tempC * 9) / 5 + 32 : tempC;
    if (exactPrecision) {
      return val.toFixed(1);
    }
    return Math.round(val).toString();
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const formatHourTime = (isoTime: string, defaultHour: string) => {
    if (!timezone) return defaultHour;
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: true,
      }).format(new Date(isoTime));
    } catch {
      return defaultHour;
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-5 sm:p-6 shadow-xl">
        {/* Header with Title and Scroll buttons */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Hourly Progression
            </h2>
            <p className="text-xs text-slate-400">
              Next 24 hours · Real-time temperature & precipitation probability
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 scroll-smooth"
        >
          {hourly.map((item, index) => {
            const temp = toDisplayTemp(item.temperature);
            const isNow = index === 0;

            return (
              <div
                key={`${item.time}-${index}`}
                className={`shrink-0 w-24 sm:w-28 flex flex-col items-center py-3.5 px-2 rounded-2xl border transition-all ${
                  isNow
                    ? 'bg-amber-400/20 border-amber-300/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                {/* Time */}
                <span className="text-xs font-medium text-slate-300">
                  {isNow ? 'Now' : formatHourTime(item.time, item.formattedHour)}
                </span>

                {/* Animated Icon */}
                <div className="my-2.5">
                  <AnimatedWeatherIcon
                    category={item.conditionCategory}
                    isDay={item.isDay}
                    size="sm"
                  />
                </div>

                {/* Temperature */}
                <span className="text-lg font-bold font-sans text-white tabular-nums">
                  {temp}°
                </span>

                {/* Rain probability */}
                <div className="flex items-center gap-1 mt-2 text-[11px] text-sky-300">
                  <Droplets className="w-3 h-3" />
                  <span className="font-mono tabular-nums">
                    {item.precipitationProbability}%
                  </span>
                </div>

                {/* Wind */}
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                  <Wind className="w-2.5 h-2.5" />
                  <span className="font-mono tabular-nums">
                    {unit === 'f'
                      ? `${Math.round(item.windSpeed * 0.621371)} mph`
                      : `${item.windSpeed} km/h`}
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
