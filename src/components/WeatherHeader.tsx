import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Volume2,
  VolumeX,
  CloudSun,
  Loader2,
  X,
  History,
  Check,
} from 'lucide-react';
import { LocationData, WeatherConditionCategory } from '../types/weather';
import { searchLocations } from '../services/weatherApi';

interface WeatherHeaderProps {
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  unit: 'c' | 'f';
  onToggleUnit: () => void;
  isAudioActive: boolean;
  onToggleAudio: () => void;
  atmosphereOverride: WeatherConditionCategory | 'auto';
  onSetAtmosphereOverride: (cat: WeatherConditionCategory | 'auto') => void;
  exactPrecision?: boolean;
  onTogglePrecision?: () => void;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
  currentLocation,
  onSelectLocation,
  onUseCurrentLocation,
  isLocating,
  unit,
  onToggleUnit,
  isAudioActive,
  onToggleAudio,
  atmosphereOverride,
  onSetAtmosphereOverride,
  exactPrecision = true,
  onTogglePrecision,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAtmosphereMenu, setShowAtmosphereMenu] = useState(false);
  const [recentSearches, setRecentSearches] = useState<LocationData[]>(() => {
    try {
      const stored = localStorage.getItem('auracast_recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationData) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setIsOpen(false);

    // Save to recents
    const updated = [loc, ...recentSearches.filter(r => r.name !== loc.name)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('auracast_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleClearInput = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 py-3 px-4 sm:px-6 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-xl">
        {/* ZONE 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center justify-between md:justify-start gap-3 shrink-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            AuraCast
          </span>

          {/* Mobile Current Location Pin indicator */}
          <span className="md:hidden text-xs text-slate-300 font-medium flex items-center gap-1 truncate max-w-[150px]">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {currentLocation.name}
          </span>
        </div>

        {/* ZONE 2: Search Input & Geolocation Controls */}
        <div className="flex-1 max-w-lg md:mx-4 relative" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder="Search city, district, or coordinates (e.g. Tokyo, Paris)..."
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 focus:border-white/30 rounded-xl outline-none transition-all"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={handleClearInput}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {isSearching ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin mr-1.5" />
              ) : (
                <button
                  onClick={onUseCurrentLocation}
                  disabled={isLocating}
                  title="Detect GPS location"
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isLocating
                      ? 'bg-amber-400 text-slate-950 animate-pulse'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-bounce' : 'text-amber-400'}`} />
                  <span className="hidden sm:inline">GPS</span>
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete & Recents Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-white/5">
              {searchResults.length > 0 ? (
                <div>
                  <div className="px-3.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-white/5">
                    Matching Locations
                  </div>
                  {searchResults.map((loc, idx) => (
                    <button
                      key={`${loc.name}-${loc.latitude}-${idx}`}
                      onClick={() => handleSelect(loc)}
                      className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-white/10 transition-colors flex items-center justify-between text-slate-200 hover:text-white group"
                    >
                      <div className="truncate">
                        <span className="font-semibold text-white group-hover:text-amber-300">
                          {loc.name}
                        </span>
                        {loc.admin1 && (
                          <span className="text-slate-400 text-xs ml-1.5">
                            · {loc.admin1}
                          </span>
                        )}
                        <span className="text-slate-400 text-xs ml-1.5">
                          · {loc.country}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-2">
                        {loc.latitude.toFixed(1)}°, {loc.longitude.toFixed(1)}°
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="px-4 py-4 text-xs text-slate-400 text-center">
                  No locations found matching &quot;{searchQuery}&quot;
                </div>
              ) : recentSearches.length > 0 ? (
                <div>
                  <div className="px-3.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-white/5 flex items-center gap-1.5">
                    <History className="w-3 h-3" /> Recent Searches
                  </div>
                  {recentSearches.map((loc, idx) => (
                    <button
                      key={`recent-${loc.name}-${idx}`}
                      onClick={() => handleSelect(loc)}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-between text-slate-300 hover:text-white"
                    >
                      <span className="font-medium text-white">{loc.name}, {loc.country}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Recent</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400 text-center">
                  Type any city or country name to search
                </div>
              )}
            </div>
          )}
        </div>

        {/* ZONE 3: Actions (Atmosphere, Audio & Unit Toggle) */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          {/* Atmosphere Simulation Menu */}
          <div className="relative">
            <button
              onClick={() => setShowAtmosphereMenu(!showAtmosphereMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg transition-colors whitespace-nowrap"
              title="Change atmospheric simulation background"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span className="capitalize">
                {atmosphereOverride === 'auto' ? 'Auto Sky' : atmosphereOverride}
              </span>
            </button>

            {showAtmosphereMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-1"
                onMouseLeave={() => setShowAtmosphereMenu(false)}
              >
                <div className="px-2.5 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Sky Atmosphere
                </div>
                {[
                  { id: 'auto', label: 'Auto (Real-time)', icon: '⚡' },
                  { id: 'sunny', label: 'Sunny & Charming', icon: '☀️' },
                  { id: 'cloudy', label: 'Cloudy & Overcast', icon: '☁️' },
                  { id: 'rainy', label: 'Rainy Downpour', icon: '🌧️' },
                  { id: 'thunderstorm', label: 'Thunderstorm', icon: '⛈️' },
                  { id: 'snowy', label: 'Snowfall', icon: '❄️' },
                  { id: 'clear_night', label: 'Clear Starry Night', icon: '✨' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSetAtmosphereOverride(item.id as any);
                      setShowAtmosphereMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      atmosphereOverride === item.id
                        ? 'bg-amber-400/20 text-amber-300 font-semibold'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>
                      {item.icon} {item.label}
                    </span>
                    {atmosphereOverride === item.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Procedural Ambient Audio */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-lg border transition-all ${
              isAudioActive
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                : 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border-white/10'
            }`}
            title={isAudioActive ? 'Mute procedural ambient sound' : 'Enable relaxing real-time weather ambient sound'}
          >
            {isAudioActive ? (
              <Volume2 className="w-4 h-4 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Precision Resolution Toggle */}
          {onTogglePrecision && (
            <button
              onClick={onTogglePrecision}
              className={`px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all tabular-nums shrink-0 ${
                exactPrecision
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.15)]'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300 border-white/10'
              }`}
              title="Toggle 0.1° decimal sensor precision or standard rounding"
            >
              {exactPrecision ? '0.1° Exact' : 'Round'}
            </button>
          )}

          {/* Temperature Unit Toggle */}
          <button
            onClick={onToggleUnit}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-colors tabular-nums shrink-0"
            title="Toggle Celsius / Fahrenheit"
          >
            °{unit.toUpperCase()}
          </button>

          {/* Quick Jump to Footer */}
          <button
            onClick={() => {
              const footerEl = document.getElementById('footer');
              if (footerEl) {
                footerEl.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg transition-colors shrink-0"
            title="Scroll to Footer & Info"
          >
            <span>Footer</span>
          </button>
        </div>
      </div>
    </header>
  );
};
