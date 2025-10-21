
interface CurrentWeather {
  temperature?: number;
  weathercode?: number;
}

export default interface WeatherData {
  current_weather?: CurrentWeather;
}