/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LocationData,
  FullWeatherResponse,
  AiInsights,
  WeatherConditionCategory,
  WeatherAlert,
} from './types/weather';
import { fetchWeatherData, fetchAiInsights, reverseGeocodeCoordinates } from './services/weatherApi';
import { weatherAudio } from './services/soundEffects';
import { weatherNotification } from './services/notificationService';
import { detectWeatherAlerts } from './utils/alertDetector';
import { WeatherAtmosphere } from './components/WeatherAtmosphere';
import { WeatherHeader } from './components/WeatherHeader';
import { WeatherAlertBanner } from './components/WeatherAlertBanner';
import { HeroWeather } from './components/HeroWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { TelemetryGrid } from './components/TelemetryGrid';
import { AiInsightsPanel } from './components/AiInsightsPanel';
import { CityFavorites } from './components/CityFavorites';
import { AtmosphericRadar } from './components/AtmosphericRadar';
import { Footer } from './components/Footer';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_LOCATION: LocationData = {
  name: 'London',
  country: 'United Kingdom',
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: 'Europe/London',
};

export default function App() {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<FullWeatherResponse | null>(null);
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Weather Alerts State
  const [activeAlerts, setActiveAlerts] = useState<WeatherAlert[]>([]);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  // User Settings
  const [unit, setUnit] = useState<'c' | 'f'>(() => {
    return (localStorage.getItem('auracast_unit') as 'c' | 'f') || 'c';
  });

  const [exactPrecision, setExactPrecision] = useState<boolean>(() => {
    const saved = localStorage.getItem('auracast_exact_precision');
    return saved !== null ? saved === 'true' : true;
  });

  const handleTogglePrecision = () => {
    setExactPrecision((prev) => {
      const next = !prev;
      localStorage.setItem('auracast_exact_precision', String(next));
      return next;
    });
  };

  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [atmosphereOverride, setAtmosphereOverride] = useState<WeatherConditionCategory | 'auto'>('auto');

  // Toggle unit
  const handleToggleUnit = () => {
    const next = unit === 'c' ? 'f' : 'c';
    setUnit(next);
    localStorage.setItem('auracast_unit', next);
  };

  // Toggle sound
  const handleToggleAudio = () => {
    if (!weather) return;
    const effectiveCategory =
      atmosphereOverride !== 'auto'
        ? atmosphereOverride
        : weather.current.conditionCategory;
    const active = weatherAudio.toggle(effectiveCategory);
    setIsAudioActive(active);
  };

  // Fetch weather and AI insights
  const loadWeatherData = useCallback(async (targetLoc: LocationData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(targetLoc);
      setWeather(data);
      setIsLoading(false);

      // Detect severe weather alerts
      const detected = detectWeatherAlerts(data);
      setActiveAlerts(detected);

      // Trigger push notification if severe conditions exist
      if (detected.length > 0) {
        weatherNotification.sendPushAlert(detected[0]);
      }

      // Update audio if currently playing
      if (isAudioActive) {
        weatherAudio.updateCondition(data.current.conditionCategory);
      }

      // Fetch AI Insights in parallel
      setIsInsightsLoading(true);
      fetchAiInsights(data)
        .then((insights) => {
          setAiInsights(insights);
        })
        .finally(() => {
          setIsInsightsLoading(false);
        });
    } catch (err: any) {
      console.warn('Weather load warning:', err);
      setError(err?.message || 'Failed to load weather data. Please try again.');
      setIsLoading(false);
    }
  }, [isAudioActive]);

  // Initial load with automatic geolocation & smart detection
  useEffect(() => {
    let hasLoaded = false;

    // 1. Check if user already has a saved city in localStorage
    const savedLocStr = localStorage.getItem('auracast_last_location');
    if (savedLocStr) {
      try {
        const savedLoc = JSON.parse(savedLocStr);
        if (savedLoc && typeof savedLoc.latitude === 'number' && typeof savedLoc.longitude === 'number') {
          setLocation(savedLoc);
          loadWeatherData(savedLoc);
          return;
        }
      } catch {
        // Continue to fresh detection
      }
    }

    // 2. Attempt browser geolocation
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (hasLoaded) return;
          hasLoaded = true;
          const { latitude, longitude } = pos.coords;
          const resolvedLoc = await reverseGeocodeCoordinates(latitude, longitude);
          setLocation(resolvedLoc);
          localStorage.setItem('auracast_last_location', JSON.stringify(resolvedLoc));
          setIsLocating(false);
          await loadWeatherData(resolvedLoc);
        },
        async () => {
          if (hasLoaded) return;
          hasLoaded = true;
          setIsLocating(false);
          // Try intelligent IP / timezone detection before falling back to default
          try {
            const detectRes = await fetch('/api/detect-location');
            if (detectRes.ok) {
              const detected = await detectRes.json();
              if (detected?.name && typeof detected.latitude === 'number') {
                setLocation(detected);
                localStorage.setItem('auracast_last_location', JSON.stringify(detected));
                await loadWeatherData(detected);
                return;
              }
            }
          } catch {
            // fallback
          }
          loadWeatherData(DEFAULT_LOCATION);
        },
        { timeout: 6000 }
      );
    } else {
      // Direct detection if geolocation is unsupported
      fetch('/api/detect-location')
        .then((r) => r.json())
        .then((detected) => {
          if (detected?.name && typeof detected.latitude === 'number') {
            setLocation(detected);
            localStorage.setItem('auracast_last_location', JSON.stringify(detected));
            loadWeatherData(detected);
          } else {
            loadWeatherData(DEFAULT_LOCATION);
          }
        })
        .catch(() => loadWeatherData(DEFAULT_LOCATION));
    }

    return () => {
      hasLoaded = true;
    };
  }, []);

  // Location selector
  const handleSelectLocation = (newLoc: LocationData) => {
    setLocation(newLoc);
    localStorage.setItem('auracast_last_location', JSON.stringify(newLoc));
    loadWeatherData(newLoc);
  };

  // Explicit user-triggered geolocation detector
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const resolvedLoc = await reverseGeocodeCoordinates(latitude, longitude);
        setLocation(resolvedLoc);
        localStorage.setItem('auracast_last_location', JSON.stringify(resolvedLoc));
        await loadWeatherData(resolvedLoc);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Dismiss an alert
  const handleDismissAlert = (alertId: string) => {
    setDismissedAlertIds((prev) => new Set([...prev, alertId]));
  };

  // Simulate an alert (for testing severe conditions and push notifications)
  const handleSimulateAlert = (simAlert: WeatherAlert) => {
    setActiveAlerts((prev) => [simAlert, ...prev.filter((a) => a.id !== simAlert.id)]);
    // Re-enable if previously dismissed
    setDismissedAlertIds((prev) => {
      const next = new Set(prev);
      next.delete(simAlert.id);
      return next;
    });
    // Trigger desktop push notification & chime
    weatherNotification.sendPushAlert(simAlert, true);
  };

  // Filtered visible alerts
  const visibleAlerts = useMemo(() => {
    return activeAlerts.filter((a) => !dismissedAlertIds.has(a.id));
  }, [activeAlerts, dismissedAlertIds]);

  // Determine active atmosphere category
  const activeAtmosphereCategory: WeatherConditionCategory =
    atmosphereOverride !== 'auto'
      ? atmosphereOverride
      : weather?.current.conditionCategory || 'cloudy';

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900 font-sans transition-colors duration-1000 ${
        weather ? 'text-slate-100' : 'text-slate-900 default-app-gradient'
      }`}
      style={
        !weather
          ? {
              backgroundColor: '#91cde6',
              backgroundImage:
                'linear-gradient(90deg, rgba(145, 205, 230, 1) 0%, rgba(141, 227, 177, 1) 50%, rgba(230, 218, 117, 1) 100%)',
            }
          : undefined
      }
    >
      {/* GOOGLE MAPS PLATFORM QUOTA DEFENSE BANNER */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 1. DYNAMIC LIVING ATMOSPHERIC BACKGROUND */}
      <WeatherAtmosphere
        isLoaded={Boolean(weather)}
        category={activeAtmosphereCategory}
        isDay={weather ? weather.current.isDay : true}
        windSpeed={weather?.current.windSpeed}
        precipitation={weather?.current.precipitation}
      />

      {/* 2. MAIN APPLICATION CONTENT LAYER */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header Bar with responsive search & geolocation */}
        <WeatherHeader
          currentLocation={location}
          onSelectLocation={handleSelectLocation}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLocating={isLocating}
          unit={unit}
          onToggleUnit={handleToggleUnit}
          isAudioActive={isAudioActive}
          onToggleAudio={handleToggleAudio}
          atmosphereOverride={atmosphereOverride}
          onSetAtmosphereOverride={setAtmosphereOverride}
          exactPrecision={exactPrecision}
          onTogglePrecision={handleTogglePrecision}
        />

        {/* Global Cities Quick Strip */}
        <CityFavorites
          currentCityName={location.name}
          onSelectCity={handleSelectLocation}
        />

        {/* Severe Weather Alert Banner & Notification System */}
        <WeatherAlertBanner
          alerts={visibleAlerts}
          onDismissAlert={handleDismissAlert}
          onSimulateAlert={handleSimulateAlert}
        />

        {/* Loading State */}
        {isLoading && !weather && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] gap-3">
            <Loader2 className="w-10 h-10 text-slate-800 animate-spin" />
            <p className="text-sm font-semibold text-slate-800">
              Reading atmospheric sensors for {location.name}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !weather && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] px-4">
            <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 text-center max-w-md">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Meteorological Telemetry Unavailable
              </h3>
              <p className="text-xs text-slate-300 mb-4">{error}</p>
              <button
                onClick={() => loadWeatherData(location)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 mx-auto transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Main Meteorological Dashboard */}
        {weather && (
          <main className="space-y-3 pb-8">
            {/* Hero Main Condition & Temperature */}
            <HeroWeather
              location={weather.location}
              current={weather.current}
              todayDaily={weather.daily[0]}
              unit={unit}
              poeticNote={aiInsights?.poeticNote}
              onRefresh={() => loadWeatherData(location)}
              isRefreshing={isLoading}
              exactPrecision={exactPrecision}
              onTogglePrecision={handleTogglePrecision}
            />

            {/* 24-Hour Hourly Progression Strip */}
            <HourlyForecast
              hourly={weather.hourly}
              unit={unit}
              timezone={weather.location.timezone}
              exactPrecision={exactPrecision}
            />

            {/* 2-Column Split: Extended Forecast + Telemetry Grid */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5">
                <DailyForecast
                  daily={weather.daily}
                  unit={unit}
                  exactPrecision={exactPrecision}
                />
              </div>
              <div className="lg:col-span-7">
                <TelemetryGrid
                  current={weather.current}
                  airQuality={weather.airQuality}
                  solar={weather.solar}
                  unit={unit}
                  timezone={weather.location.timezone}
                  exactPrecision={exactPrecision}
                />
              </div>
            </div>

            {/* Doppler Radar / Cloud Visualizer */}
            <AtmosphericRadar
              location={weather.location}
              conditionCategory={weather.current.conditionCategory}
              precipitation={weather.current.precipitation}
            />

            {/* AI Insights & Lifestyle Attire Panel */}
            <AiInsightsPanel
              insights={aiInsights}
              isLoading={isInsightsLoading}
            />
          </main>
        )}

        {/* 3. NEW FOOTER COMPONENT */}
        <Footer
          isWeatherLoaded={Boolean(weather)}
          onGoHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      </div>
    </div>
  );
}
