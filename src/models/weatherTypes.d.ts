interface WeatherCondition {
  id: number;
  main: string;
}

// Only included the ones I currently utilize - there's a few other good ones not captured here
export interface ICurrentWeatherResponse {
  dt: number;
  weather: WeatherCondition[];
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
}

export interface IHourlyWeatherResponse extends ICurrentWeatherResponse {
  pop: number;
}

export interface IDailyWeatherResponse extends Omit<IHourlyWeatherResponse, 'temp'> {
  temp: {
    min: number;
    max: number;
  };
}

export interface IWeatherAlertResponse {
  sender_name: string;
  event: string;
  description: string;
}

export interface IParsedCurrentWeather {
  condition: string;
  iconCode: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
}

export interface IParsedHourlyWeather extends Omit<IParsedCurrentWeather, 'wind'> {
  hour: number;
  rainChance: number;
}

export interface IParsedDailyWeather {
  day: string;
  iconCode: number;
  condition: string;
  tempHigh: number;
  tempLow: number;
}
