import { FullWeatherResponse, WeatherAlert } from '../types/weather';

export function detectWeatherAlerts(weather: FullWeatherResponse): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const current = weather.current;
  const location = weather.location;
  const now = new Date();
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const effective = formatTime(now);
  const expires = formatTime(new Date(now.getTime() + 4 * 60 * 60 * 1000));

  // 1. OFFICIAL ALERTS FROM GOOGLE WEATHER API
  if (weather.alerts && weather.alerts.length > 0) {
    alerts.push(...weather.alerts);
  }

  // 2. THUNDERSTORM DETECTION
  const isThunderstorm =
    current.weatherConditionType?.includes('THUNDERSTORM') ||
    weather.hourly.slice(0, 6).some((h) => h.weatherConditionType?.includes('THUNDERSTORM'));

  if (isThunderstorm && !alerts.some((a) => a.event.toLowerCase().includes('thunderstorm'))) {
    const isSevere = current.weatherConditionType?.includes('HEAVY') || current.windGusts >= 65;
    alerts.push({
      id: `alert-thunderstorm-${location.name}`,
      title: isSevere ? 'Severe Thunderstorm & Lightning Warning' : 'Thunderstorm Warning',
      headline: `Active lightning and squalls detected over ${location.name}`,
      severity: isSevere ? 'emergency' : 'warning',
      event: 'Severe Thunderstorm',
      description: `Atmospheric sensors indicate intense electrical activity with sudden downpours and gusty wind squalls up to ${current.windGusts} km/h.`,
      instruction:
        'Seek sturdy indoor shelter immediately. Unplug sensitive electrical devices and avoid open spaces or tall trees.',
      effectiveTime: effective,
      expiresTime: expires,
      iconName: 'thunderstorm',
      source: 'Google Weather API Meteorological Sensors',
    });
  }

  // 3. HEAVY RAIN / FLOODING
  const isHeavyRain =
    current.weatherConditionType?.includes('HEAVY_RAIN') ||
    current.precipitation >= 12 ||
    weather.hourly.slice(0, 6).some((h) => h.precipitationProbability >= 85 && h.precipitation >= 8);

  if (
    isHeavyRain &&
    !alerts.some((a) => a.event.toLowerCase().includes('rain') || a.event.toLowerCase().includes('flood'))
  ) {
    alerts.push({
      id: `alert-rain-${location.name}`,
      title: 'Heavy Rainfall & Urban Flood Advisory',
      headline: `Excessive precipitation event active over ${location.name}`,
      severity: 'warning',
      event: 'Heavy Rainfall',
      description: `Rainfall accumulation is active with high probability. Localized drainage pooling and low visibility on roadways.`,
      instruction:
        'Allow extra travel time. Never drive through flooded roads or underpasses. Maintain safe vehicle braking distance.',
      effectiveTime: effective,
      expiresTime: expires,
      iconName: 'rain',
      source: 'Google Weather API Meteorological Sensors',
    });
  }

  // 4. EXTREME HEAT
  if (
    (current.temperature >= 35 || current.apparentTemperature >= 38) &&
    !alerts.some((a) => a.event.toLowerCase().includes('heat'))
  ) {
    alerts.push({
      id: `alert-heat-${location.name}`,
      title: 'Excessive Heat & Thermal Warning',
      headline: `Dangerous thermal index of ${current.apparentTemperature}°C in ${location.name}`,
      severity: current.temperature >= 39 ? 'emergency' : 'warning',
      event: 'Extreme Heat',
      description: `Ambient temperatures have reached ${current.temperature}°C with elevated heat stress index. Prolonged sun exposure poses severe risk of dehydration and heat exhaustion.`,
      instruction:
        'Stay in air-conditioned environments when possible. Drink abundant water and avoid strenuous outdoor activity during peak sun hours.',
      effectiveTime: effective,
      expiresTime: expires,
      iconName: 'temperature-high',
      source: 'Google Weather API Meteorological Sensors',
    });
  }

  // 5. FREEZING / HARD FROST
  if (
    (current.temperature <= -4 || current.apparentTemperature <= -8) &&
    !alerts.some((a) => a.event.toLowerCase().includes('freeze') || a.event.toLowerCase().includes('cold'))
  ) {
    alerts.push({
      id: `alert-cold-${location.name}`,
      title: 'Hard Freeze & Sub-Zero Wind Chill Advisory',
      headline: `Freezing temperatures of ${current.temperature}°C in ${location.name}`,
      severity: 'warning',
      event: 'Freeze Warning',
      description: `Sub-zero conditions with wind chill reaching ${current.apparentTemperature}°C. Black ice formation likely on bridges and elevated walkways.`,
      instruction:
        'Dress in thermal multi-layer insulation. Protect exposed pipes, companion animals, and sensitive vegetation.',
      effectiveTime: effective,
      expiresTime: expires,
      iconName: 'temperature-low',
      source: 'Google Weather API Meteorological Sensors',
    });
  }

  // 6. HIGH WIND / GALE
  if (
    (current.windSpeed >= 40 || current.windGusts >= 60) &&
    !alerts.some((a) => a.event.toLowerCase().includes('wind') || a.event.toLowerCase().includes('gale'))
  ) {
    alerts.push({
      id: `alert-wind-${location.name}`,
      title: 'High Wind & Gale Squall Warning',
      headline: `Sustained winds of ${current.windSpeed} km/h with gusts to ${current.windGusts} km/h`,
      severity: current.windGusts >= 75 ? 'emergency' : 'warning',
      event: 'High Wind',
      description: `Gale-force atmospheric pressure differentials are producing hazardous crosswinds and turbulence across the district.`,
      instruction:
        'Secure outdoor patio furnishings and loose objects. High-profile vehicles should exercise extreme caution on highways.',
      effectiveTime: effective,
      expiresTime: expires,
      iconName: 'wind',
      source: 'Google Weather API Meteorological Sensors',
    });
  }

  // 7. EXTREME UV RADIATION
  if (current.uvIndex >= 8 && !alerts.some((a) => a.event.toLowerCase().includes('uv'))) {
    alerts.push({
      id: `alert-uv-${location.name}`,
      title: 'Very High Solar UV Radiation Alert',
      headline: `UV Index has reached level ${current.uvIndex} in ${location.name}`,
      severity: 'advisory',
      event: 'Extreme UV',
      description: `Intense solar radiation index can cause erythema and skin burns within 12 to 15 minutes of unprotected sun exposure.`,
      instruction:
        'Apply broad-spectrum SPF 30+ sunscreen. Wear polarized sunglasses and wide-brim hats between 10 AM and 4 PM.',
      effectiveTime: effective,
      expiresTime: expires,
      iconName: 'sun',
      source: 'Google Weather API Meteorological Sensors',
    });
  }

  // 8. AIR QUALITY ALERT
  if (weather.airQuality && weather.airQuality.usAqi >= 150 && !alerts.some((a) => a.event.toLowerCase().includes('air'))) {
    alerts.push({
      id: `alert-air-${location.name}`,
      title: 'Unhealthy Air Quality Index Alert',
      headline: `AQI is elevated at ${weather.airQuality.usAqi} (${weather.airQuality.category})`,
      severity: weather.airQuality.usAqi >= 200 ? 'warning' : 'advisory',
      event: 'Air Quality',
      description: `Elevated particulate concentrations (PM2.5: ${weather.airQuality.pm25} µg/m³) exceed public health guidelines.`,
      instruction:
        'Individuals with respiratory conditions, children, and seniors should limit prolonged outdoor exertion.',
      effectiveTime: effective,
      expiresTime: expires,
      iconName: 'air',
      source: 'Google Air Quality API',
    });
  }

  return alerts;
}
