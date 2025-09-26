export interface LocationSearchResult {
  id: number;
  name: string;
  country: string;
}

export interface WeatherData {
  current: {
    temp_c: number;
    temp_f: number;
    feelslike_c: number;
    feelslike_f: number;
    wind_mph: number;
    wind_kph: number;
    humidity: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}
