export type WeatherConditionCategory =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'thunderstorm'
  | 'snowy'
  | 'foggy'
  | 'clear_night';

export interface LocationData {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  countryCode?: string;
  timezone?: string;
  elevation?: number;
  formattedAddress?: string;
}

export interface CurrentWeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherConditionType: string;
  conditionText: string;
  conditionCategory: WeatherConditionCategory;
  isDay: boolean;
  precipitation: number;
  precipitationProbability: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  visibility: number;
  dewPoint: number;
  time: string;
}

export interface HourlyForecastItem {
  time: string;
  formattedHour: string;
  temperature: number;
  apparentTemperature: number;
  weatherConditionType: string;
  conditionCategory: WeatherConditionCategory;
  conditionText: string;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  isDay: boolean;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  formattedDate: string;
  weatherConditionType: string;
  conditionCategory: WeatherConditionCategory;
  conditionText: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  europeanAqi: number;
  usAqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  ozone?: number;
  nitrogenDioxide?: number;
}

export interface SolarData {
  sunrise: string;
  sunset: string;
  daylightDurationHours: number;
  solarNoon?: string;
  timezone?: string;
}

export type AlertSeverity = 'advisory' | 'watch' | 'warning' | 'emergency';

export interface WeatherAlert {
  id: string;
  title: string;
  headline: string;
  severity: AlertSeverity;
  event: string;
  description: string;
  instruction: string;
  effectiveTime: string;
  expiresTime: string;
  iconName: 'thunderstorm' | 'rain' | 'temperature-high' | 'temperature-low' | 'wind' | 'sun' | 'air';
  source?: string;
}

export interface FullWeatherResponse {
  location: LocationData;
  current: CurrentWeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  solar: SolarData;
  alerts?: WeatherAlert[];
  meta?: {
    provider: string;
    model: string;
    attribution: string;
  };
  updatedAt: string;
}

export interface AiInsights {
  summary: string;
  poeticNote: string;
  clothingRecommendation: {
    title: string;
    description: string;
    items: string[];
  };
  activityScores: {
    activity: string;
    score: number; // 0 - 100
    recommendation: string;
  }[];
  hourlyHighlights: string[];
}
