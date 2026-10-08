import React from 'react';
import { LocationData } from '../types/weather';

interface CityFavoritesProps {
  currentCityName: string;
  onSelectCity: (loc: LocationData) => void;
}

const FAMOUS_CITIES: LocationData[] = [
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Los Angeles', country: 'United States', admin1: 'California', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Chicago', country: 'United States', admin1: 'Illinois', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
];

export const CityFavorites: React.FC<CityFavoritesProps> = ({
  currentCityName,
  onSelectCity,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-medium shrink-0 mr-1">
          Quick Jump:
        </span>
        {FAMOUS_CITIES.map((city) => {
          const isActive = currentCityName.toLowerCase() === city.name.toLowerCase();
          return (
            <button
              key={city.name}
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/5 hover:border-white/20'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
