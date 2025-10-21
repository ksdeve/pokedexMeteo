export default interface WeatherPayload {
  city: string;
  temperature: number | undefined;
  weathercode: number | undefined;
  state: WeatherState;
}

export type WeatherState = "clear" | "cloudy" | "fog" | "rain" | "snow" | "thunder" | "unknown";
