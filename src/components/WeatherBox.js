import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WeatherBox = (props) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState(null);
  const [hourlyWeather, setHourlyWeather] = useState(null);
  const [dailyWeather, setDailyWeather] = useState(null);

  const getWeatherData = async () => {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${props.familyLocation.lat}&lon=${props.familyLocation.long}&exclude=minutely&appid=${props.apiKey}&units=imperial`; // Exclude minutely forecast
    const weatherData = await axios.get(url).then(resp => {
      if (resp.data) {
        // Get current
        setCurrentWeather(resp.data.current);

        // Get alerts (if any)
        if (resp.data.alerts) {
          setWeatherAlerts(resp.data.alerts);
        }

        // Get next 12 hours
        setHourlyWeather(resp.data.hourly.slice(1, 12));

        // Get NEXT 5 days (daily[] - idx 1..5)
        setDailyWeather(resp.data.daily.slice(1, 5));
      } else {
        console.error("Error: weather data missing");
      }
    }).catch(err => {
      console.error("Error getting weather: " + err);
    });
  };

  const getDayOfWeek = (dayNum) => {
    switch(dayNum) {
      case 0: return 'Sunday';
      case 1: return 'Monday';
      case 2: return 'Tuesday';
      case 3: return 'Wednesday';
      case 4: return 'Thursday';
      case 5: return 'Friday';
      case 6: return 'Saturday';
      default: console.error('ERROR: Incorrect day of week');
    }
  };

  const getWeatherIconCode = (weatherId) => {
    if (weatherId >= 200 && weatherId <= 299) return '11d';
    else if (weatherId >= 300 && weatherId <= 399) return '09d';
    else if (weatherId >= 500 && weatherId <= 504) return '10d';
    else if (weatherId === 511) return '13d';
    else if (weatherId >= 520 && weatherId <= 531) return '09d';
    else if (weatherId >= 600 && weatherId <= 699) return '13d';
    else if (weatherId >= 700 && weatherId <= 799) return '50d';
    else if (weatherId === 800 || weatherId === 801) {
      const curHour = new Date().getHours()
      const isDaytime = (curHour >= 6 && curHour <= 18)

      if (weatherId === 800) return isDaytime ? '01d' : '01n';
      else return isDaytime ? '02d' : '02n';
    } else if (weatherId === 802) return '03d';
    else if (weatherId === 803 || weatherId === 804) return '04d';
  };

  const parseCurrentWeather = () => {
    if (!currentWeather) { return; }
    const curWeatherInfo = {
      condition: currentWeather.weather[0].main,
      iconLink: `http://openweathermap.org/img/wn/${getWeatherIconCode(currentWeather.weather[0].id)}@4x.png`,
      temp: Math.trunc(currentWeather.temp),
      feelsLike: Math.trunc(currentWeather.feels_like),
      humidity: currentWeather.humidity,
      wind: Math.trunc(currentWeather.wind_speed)
    };

    return (
      <div className='flex flex-col items-center'>
        <h3>{curWeatherInfo.condition}</h3>
        <img src={curWeatherInfo.iconLink} alt='Weather icon' />
        <h4>{curWeatherInfo.temp}°F</h4>
        <h5>Feels like {curWeatherInfo.feelsLike}°</h5>
        <h6>Humidity: {curWeatherInfo.humidity}%</h6>
        <h6>Wind: {curWeatherInfo.wind}mph</h6>
      </div>
    );
  };

  const parseWeatherAlerts = () => {
    if (!weatherAlerts) return;

    let parsedAlerts = [];

    weatherAlerts.forEach(alert => {
      if (alert.sender_name.includes('Environmental Protection Agency') || alert.sender_name.includes('Integrated Public Alert and Warning System') || alert.sender_name.includes('National Oceanic and Atmospheric Administration') || alert.sender_name.includes('U.S. Geological Survey')) {
        parsedAlerts.push({
          event: alert.event,
          reporter: alert.sender_name,
          description: alert.description
        });
      }
    });

    if (!parsedAlerts) return;

    return (
      <div>
        {parsedAlerts.map(alert => {
          return (
            <div>
              <h3>{alert.event}</h3>
              <h5>{alert.reporter}</h5>
              <p>{alert.description}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const parseHourlyWeather = () => {
    if (!hourlyWeather) return;

    let parsedHourlyReports = [];

    hourlyWeather.forEach(hour => {
      parsedHourlyReports.push({
        hour: new Date(1000 * hour.dt).getHours(),
        iconLink: `http://openweathermap.org/img/wn/${getWeatherIconCode(hour.weather[0].id)}.png`,
        condition: hour.weather[0].main,
        temp: Math.trunc(hour.temp),
        feelsLike: Math.trunc(hour.feels_like),
        rainChance: hour.pop,
        humidity: hour.humidity
      });
    });

    return (
      <div className='flex flex-row'>
        {parsedHourlyReports.map(rpt => {
          return (
            <div className='flex flex-col items-center'>
              <h3>{rpt.hour}</h3>
              <img src={rpt.iconLink} alt='Weather icon' />
              <h4>{rpt.condition}</h4>
              <h5>{rpt.temp}°F (Feels like {rpt.feelsLike}°)</h5>
              <h6>Humidity: {rpt.humidity}%</h6>
            </div>
          );
        })}
      </div>
    );
  };

  const parseDailyWeather = () => {
    if (!dailyWeather) return;

    let parsedDailyReports = [];

    dailyWeather.forEach(day => {
      parsedDailyReports.push({
        day: getDayOfWeek(new Date(1000 * day.dt).getDay()),
        iconLink: `http://openweathermap.org/img/wn/${getWeatherIconCode(day.weather[0].id)}@2x.png`,
        condition: day.weather[0].main,
        tempHigh: Math.trunc(day.temp.max),
        tempLow: Math.trunc(day.temp.min)
      });
    });

    return (
      <div className='flex flex-row'>
        {parsedDailyReports.map(rpt => {
          return (
            <div className='flex flex-col items-center'>
              <h3>{rpt.day}</h3>
              <img src={rpt.iconLink} alt='Weather icon' />
              <h4>{rpt.condition}</h4>
              <h4>High: {rpt.tempHigh}°F</h4>
              <h4>Low: {rpt.tempLow}°F</h4>
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    getWeatherData();
  }, []);

  return (
    <div>
      <div className='flex justify-center'>{parseCurrentWeather()}</div>
      <div className='flex justify-center'>{parseWeatherAlerts()}</div>
      <div className='flex justify-center'>{parseHourlyWeather()}</div>
      <div className='flex justify-center'>{parseDailyWeather()}</div>
    </div>
  );
}

export default WeatherBox;
