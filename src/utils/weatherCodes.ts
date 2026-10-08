import { WeatherConditionCategory } from '../types/weather';

export interface WeatherCodeDetails {
  title: string;
  category: WeatherConditionCategory;
  description: string;
}

export function parseGoogleWeatherType(
  type: string,
  descriptionText?: string,
  isDaytime: boolean = true
): WeatherCodeDetails {
  const normType = (type || '').toUpperCase();
  const desc = descriptionText || normType.replace(/_/g, ' ').toLowerCase();

  if (normType === 'CLEAR' || normType === 'MOSTLY_CLEAR') {
    return {
      title: isDaytime
        ? normType === 'CLEAR'
          ? 'Sunny & Clear'
          : 'Mostly Sunny'
        : normType === 'CLEAR'
        ? 'Clear Night'
        : 'Mostly Clear Night',
      category: isDaytime ? 'sunny' : 'clear_night',
      description: isDaytime
        ? 'Brilliant radiant sunshine and clear atmospheric skies.'
        : 'Crisp starlit tranquility with exceptional celestial visibility.',
    };
  }

  if (
    normType === 'PARTLY_CLOUDY' ||
    normType === 'MOSTLY_CLOUDY' ||
    normType === 'CLOUDY' ||
    normType === 'OVERCAST'
  ) {
    return {
      title:
        normType === 'PARTLY_CLOUDY'
          ? 'Partly Cloudy'
          : normType === 'OVERCAST'
          ? 'Cloudy & Overcast'
          : 'Scattered Clouds',
      category: 'cloudy',
      description: 'Layered cloud canopy drifting with ambient atmospheric depth.',
    };
  }

  if (normType.includes('THUNDERSTORM')) {
    return {
      title: normType.includes('HEAVY') ? 'Severe Thunderstorm' : 'Thunderstorm',
      category: 'thunderstorm',
      description: 'Active electrical squalls and turbulent convective air currents.',
    };
  }

  if (
    normType.includes('RAIN') ||
    normType.includes('DRIZZLE') ||
    normType.includes('SHOWERS')
  ) {
    return {
      title: normType.includes('HEAVY')
        ? 'Heavy Rain Downpour'
        : normType.includes('LIGHT')
        ? 'Light Rain Showers'
        : 'Steady Rain',
      category: 'rainy',
      description: 'Rhythmic precipitation drumming against the landscape.',
    };
  }

  if (
    normType.includes('SNOW') ||
    normType.includes('BLIZZARD') ||
    normType.includes('SLEET') ||
    normType.includes('FLURRIES')
  ) {
    return {
      title: normType.includes('HEAVY') ? 'Heavy Snowfall' : 'Snow Showers',
      category: 'snowy',
      description: 'Crystalline winter flurries floating through brisk sub-zero air.',
    };
  }

  if (
    normType.includes('FOG') ||
    normType.includes('HAZE') ||
    normType.includes('MIST')
  ) {
    return {
      title: 'Misty Fog & Haze',
      category: 'foggy',
      description: 'Dense atmospheric moisture veil reducing horizontal visibility.',
    };
  }

  return {
    title: desc.charAt(0).toUpperCase() + desc.slice(1),
    category: isDaytime ? 'sunny' : 'cloudy',
    description: 'Temperate atmospheric conditions with gentle shifting airflow.',
  };
}
