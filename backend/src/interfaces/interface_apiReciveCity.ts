// interface_apiReciveCity.ts

export interface LocationSearchResult {
  id: number;
  name: string;
  country: string;
}

// --- Interfaces para Dados Atuais (Current) ---

export interface AirQualityData {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  "us-epa-index": number;
}

// ATUALIZADO: WeatherData (Current)
export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    last_updated_epoch: number;
    temp_c: number;
    temp_f: number;      // NOVO
    feelslike_c: number;
    feelslike_f: number; // NOVO
    wind_mph: number;    // NOVO
    wind_kph: number;
    wind_dir: string;
    humidity: number;
    pressure_mb: number;
    precip_mm: number;
    uv: number;
    dewpoint_c: number;
    condition: {
      text: string;
      icon: string;
    };
    air_quality: AirQualityData;
  };
}

// --- Interfaces para Previsão (Forecast) ---

// ATUALIZADO: HourlyData
export interface HourlyData {
  time_epoch: number;
  time: string;
  temp_c: number;
  temp_f: number;      // NOVO
  wind_kph: number;
  wind_mph: number;    // NOVO
  humidity: number;
  chance_of_rain: number;
  feelslike_c: number; // NOVO
  feelslike_f: number; // NOVO
  condition: {
    text: string;
    icon: string;
  };
}

export interface AstroData {
  sunrise: string;
  sunset: string;
  moon_phase: string;
}

// ATUALIZADO: DayData
export interface DayData {
  maxtemp_c: number;
  maxtemp_f: number; // NOVO
  mintemp_c: number;
  mintemp_f: number; // NOVO
  avgtemp_c: number;
  avgtemp_f: number; // NOVO
  maxwind_kph: number; // NOVO (estava faltando)
  maxwind_mph: number; // NOVO
  daily_chance_of_rain: number;
  avghumidity: number;
  uv: number;
  condition: {
    text: string;
    icon: string;
  };
}

export interface ForecastDay {
  date: string;
  date_epoch: number;
  day: DayData;
  astro: AstroData;
  hour: HourlyData[];
}

export interface ForecastApiResponse {
  location: {
    name: string;
    region: string;
    country: string;
  };
  // A resposta do Forecast também inclui 'current'
  current: WeatherData['current']; 
  forecast: {
    forecastday: ForecastDay[];
  };
}