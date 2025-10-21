export default interface WeatherResponse {
  source: 'cache' | 'open-meteo';
  city: string;
  temperature: number;
  weathercode: number;
  state: WeatherState;
}

export type WeatherState = "clear" | "cloudy" | "fog" | "rain" | "snow" | "thunder" | "unknown";
