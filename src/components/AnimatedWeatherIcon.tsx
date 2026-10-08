import React from 'react';
import { WeatherConditionCategory } from '../types/weather';

interface AnimatedWeatherIconProps {
  category: WeatherConditionCategory;
  isDay: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  category,
  isDay,
  size = 'lg',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  const containerSize = sizeMap[size] || sizeMap.lg;

  // Sunny
  if (category === 'sunny' && isDay) {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
        {/* Pulsing Sun Rays */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-spin text-amber-400"
          style={{ animationDuration: '28s' }}
        >
          <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
            <line x1="50" y1="12" x2="50" y2="4" />
            <line x1="50" y1="88" x2="50" y2="96" />
            <line x1="12" y1="50" x2="4" y2="50" />
            <line x1="88" y1="50" x2="96" y2="50" />
            <line x1="23" y1="23" x2="17" y2="17" />
            <line x1="77" y1="77" x2="83" y2="83" />
            <line x1="23" y1="77" x2="17" y2="83" />
            <line x1="77" y1="23" x2="83" y2="17" />
          </g>
        </svg>
        {/* Sun Core */}
        <div className="absolute inset-[24%] rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 shadow-[0_0_24px_rgba(251,191,36,0.8)] animate-pulse" />
      </div>
    );
  }

  // Clear Night
  if (category === 'clear_night' || (!isDay && category === 'sunny')) {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-100 drop-shadow-[0_0_12px_rgba(224,231,255,0.7)]">
          <path
            d="M58 20 A 32 32 0 1 0 80 72 A 28 28 0 0 1 58 20 Z"
            fill="currentColor"
          />
          {/* Subtle stars */}
          <circle cx="28" cy="24" r="1.5" fill="#FDE047" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="75" cy="28" r="1.2" fill="#FDE047" />
          <circle cx="82" cy="52" r="1.8" fill="#FDE047" className="animate-pulse" />
        </svg>
      </div>
    );
  }

  // Rainy or Thunderstorm
  if (category === 'rainy' || category === 'thunderstorm') {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Cloud Base */}
          <path
            d="M26 62 A 16 16 0 0 1 36 34 A 20 20 0 0 1 70 32 A 17 17 0 0 1 84 56 A 14 14 0 0 1 76 66 L 28 66 Z"
            fill="#64748B"
            className="drop-shadow-md"
          />
          <path
            d="M28 58 A 14 14 0 0 1 36 36 A 18 18 0 0 1 68 34 A 15 15 0 0 1 80 54 A 12 12 0 0 1 74 62 L 30 62 Z"
            fill="#94A3B8"
          />

          {/* Rain Drops with Falling Animation */}
          <g stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round">
            <line x1="38" y1="72" x2="33" y2="84" className="animate-pulse" style={{ animationDuration: '0.8s' }} />
            <line x1="52" y1="74" x2="47" y2="88" className="animate-pulse" style={{ animationDuration: '0.6s', animationDelay: '0.2s' }} />
            <line x1="66" y1="72" x2="61" y2="84" className="animate-pulse" style={{ animationDuration: '0.9s', animationDelay: '0.4s' }} />
          </g>

          {/* Thunder bolt if thunderstorm */}
          {category === 'thunderstorm' && (
            <path
              d="M50 42 L42 58 L52 58 L46 76 L62 54 L52 54 Z"
              fill="#FACC15"
              className="animate-ping"
              style={{ animationDuration: '1.8s' }}
            />
          )}
        </svg>
      </div>
    );
  }

  // Snowy
  if (category === 'snowy') {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M26 56 A 16 16 0 0 1 36 30 A 20 20 0 0 1 70 28 A 17 17 0 0 1 84 50 A 14 14 0 0 1 76 60 L 28 60 Z"
            fill="#CBD5E1"
          />
          {/* Falling Flakes */}
          <g fill="#FFFFFF">
            <circle cx="36" cy="72" r="2.5" className="animate-bounce" style={{ animationDuration: '1.4s' }} />
            <circle cx="50" cy="78" r="3" className="animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
            <circle cx="64" cy="72" r="2.5" className="animate-bounce" style={{ animationDuration: '1.6s', animationDelay: '0.6s' }} />
          </g>
        </svg>
      </div>
    );
  }

  // Cloudy / Overcast / Foggy (Default)
  return (
    <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Soft Sun Peeking (if partly cloudy) */}
        {isDay && (
          <circle
            cx="66"
            cy="36"
            r="16"
            fill="#FBBF24"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />
        )}
        {/* Background Darker Cloud */}
        <path
          d="M24 64 A 18 18 0 0 1 36 34 A 22 22 0 0 1 72 32 A 18 18 0 0 1 88 56 A 16 16 0 0 1 78 68 L 26 68 Z"
          fill="#64748B"
          opacity="0.8"
        />
        {/* Foreground Cloud */}
        <path
          d="M20 70 A 16 16 0 0 1 32 42 A 20 20 0 0 1 66 40 A 16 16 0 0 1 80 62 A 14 14 0 0 1 72 74 L 22 74 Z"
          fill="#E2E8F0"
          className="drop-shadow-md"
        />
      </svg>
    </div>
  );
};
