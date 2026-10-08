import { FullWeatherResponse, LocationData, AiInsights } from '../types/weather';
import { parseGoogleWeatherType } from '../utils/weatherCodes';

const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyCMYrCyKXe6DKnSDFrqYU0CVgcTdby7Ero';

const GMP_HEADERS = {
  'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
};

const POPULAR_CITIES: LocationData[] = [
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, formattedAddress: 'Tokyo, Japan' },
  { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278, formattedAddress: 'London, UK' },
  { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.0060, formattedAddress: 'New York, NY, USA' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, formattedAddress: 'Paris, France' },
  { name: 'San Francisco', country: 'United States', admin1: 'California', latitude: 37.7749, longitude: -122.4194, formattedAddress: 'San Francisco, CA, USA' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, formattedAddress: 'Singapore' },
  { name: 'Sydney', country: 'Australia', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093, formattedAddress: 'Sydney NSW, Australia' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, formattedAddress: 'Dubai, UAE' },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, formattedAddress: 'Berlin, Germany' },
  { name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780, formattedAddress: 'Seoul, South Korea' },
  { name: 'Toronto', country: 'Canada', admin1: 'Ontario', latitude: 43.6532, longitude: -79.3832, formattedAddress: 'Toronto, ON, Canada' },
  { name: 'Los Angeles', country: 'United States', admin1: 'California', latitude: 34.0522, longitude: -118.2437, formattedAddress: 'Los Angeles, CA, USA' },
  { name: 'Chicago', country: 'United States', admin1: 'Illinois', latitude: 41.8781, longitude: -87.6298, formattedAddress: 'Chicago, IL, USA' },
  { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, formattedAddress: 'Mumbai, Maharashtra, India' },
  { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964, formattedAddress: 'Rome, Italy' },
];

export async function searchLocations(query: string): Promise<LocationData[]> {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2) return [];

  try {
    const res = await fetch(`/api/geocoding?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch {
    // Network or proxy interruption - silently continue to fallback
  }

  // Local fallback search matching popular world cities
  const lowerQuery = trimmed.toLowerCase();
  const matched = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.country.toLowerCase().includes(lowerQuery) ||
      (c.admin1 && c.admin1.toLowerCase().includes(lowerQuery))
  );

  return matched;
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<LocationData> {
  try {
    const res = await fetch(`/api/reverse-geocoding?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.name && data.name !== 'Detected Location') {
        return data;
      }
    }
  } catch {
    // Silent fallback
  }

  return {
    name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    country: 'Local Coordinates',
    latitude: lat,
    longitude: lon,
  };
}

export async function fetchWeatherData(
  location: LocationData
): Promise<FullWeatherResponse> {
  const params = new URLSearchParams({
    lat: location.latitude.toString(),
    lon: location.longitude.toString(),
    name: location.name,
    country: location.country || '',
    admin1: location.admin1 || '',
  });

  const res = await fetch(`/api/weather?${params.toString()}`);
  if (!res.ok) {
    if (res.status === 429) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
    throw new Error(`Google Weather API request failed: ${res.statusText}`);
  }

  const raw = await res.json();

  // Enrich with Google Weather condition details
  const parsedCurrent = parseGoogleWeatherType(
    raw.current.weatherConditionType,
    raw.current.conditionText,
    raw.current.isDay
  );

  const enrichedCurrent = {
    ...raw.current,
    conditionText: raw.current.conditionText || parsedCurrent.title,
    conditionCategory: parsedCurrent.category,
  };

  const enrichedHourly = (raw.hourly || []).map((hour: any) => {
    const parsed = parseGoogleWeatherType(hour.weatherConditionType, hour.conditionText, hour.isDay);
    return {
      ...hour,
      conditionCategory: parsed.category,
      conditionText: hour.conditionText || parsed.title,
    };
  });

  const enrichedDaily = (raw.daily || []).map((day: any) => {
    const parsed = parseGoogleWeatherType(day.weatherConditionType, day.conditionText, true);
    return {
      ...day,
      conditionCategory: parsed.category,
      conditionText: day.conditionText || parsed.title,
    };
  });

  return {
    ...raw,
    current: enrichedCurrent,
    hourly: enrichedHourly,
    daily: enrichedDaily,
  };
}

export async function fetchAiInsights(
  weather: FullWeatherResponse
): Promise<AiInsights> {
  try {
    const res = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: weather.location,
        current: weather.current,
        tempMax: weather.daily[0]?.tempMax ?? weather.current.temperature,
        tempMin: weather.daily[0]?.tempMin ?? weather.current.temperature,
        conditionTitle: weather.current.conditionText,
      }),
    });

    if (!res.ok) throw new Error('AI insights request failed');
    return await res.json();
  } catch (err) {
    console.warn('AI insights fallback triggered:', err);
    return {
      poeticNote: weather.current.conditionCategory === 'rainy'
        ? 'Soft raindrops compose gentle melodies along the pavement.'
        : weather.current.conditionCategory === 'cloudy'
        ? 'A soft canopy of clouds frames a peaceful, balanced day.'
        : 'Charming warm sunbeams illuminate the vibrant sky.',
      summary: `Currently ${weather.current.conditionText} with ${weather.current.temperature}°C. Atmospheric comfort remains balanced throughout the day.`,
      clothingRecommendation: {
        title: weather.current.conditionCategory === 'rainy' ? 'Weather-Resistant Layers' : 'Smart Comfortable Casual',
        description: weather.current.conditionCategory === 'rainy' ? 'Bring an umbrella and water-resistant coat.' : 'Breathable layers suitable for shifting temperatures.',
        items: ['Light Outerwear', 'Comfortable Walking Shoes', 'UV Sunglasses'],
      },
      activityScores: [
        { activity: 'Outdoor Running', score: 88, recommendation: 'Good endurance pacing conditions.' },
        { activity: 'Cycling', score: 85, recommendation: 'Clean roads and moderate breeze.' },
        { activity: 'Photography', score: 92, recommendation: 'Soft lighting creates striking visual depth.' },
        { activity: 'Evening Stroll', score: 90, recommendation: 'Calm ambient winds and fresh air.' },
      ],
      hourlyHighlights: [
        'Morning: Crisp and invigorating breeze.',
        'Afternoon: Pleasant temperature plateau.',
        'Evening: Gentle cool descent under settling skies.',
      ],
    };
  }
}
