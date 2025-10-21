// Types pour l'API Open-Meteo
interface GeoResult {
  latitude: number;
  longitude: number;
}

export default interface GeoData {
  results?: GeoResult[];
}
