import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, AlertTitle, Stack, Tab, Tabs, Typography } from '@mui/material';
import { WiRain, WiThunderstorm, WiSnowflakeCold, WiFog, WiDaySunny, WiNightClear, WiDayCloudy, WiCloudy, WiNightCloudy } from 'weather-icons-react';

const WeatherBox = (props) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState(null);
  const [hourlyWeather, setHourlyWeather] = useState(null);
  const [dailyWeather, setDailyWeather] = useState(null);
  const [shownWeather, setShownWeather] = useState(0);

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
        setHourlyWeather(resp.data.hourly.slice(1, 13));

        // Get NEXT 5 days
        setDailyWeather(resp.data.daily.slice(1, 6));
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

  const getWeatherIcon = (weatherId, size = 48) => {
    if (weatherId >= 200 && weatherId <= 299) return (<WiThunderstorm size={size} />);
    else if (weatherId >= 300 && weatherId <= 399) return (<WiRain size={size} />);
    else if (weatherId >= 500 && weatherId <= 504) return (<WiRain size={size} />);
    else if (weatherId === 511) return (<WiSnowflakeCold size={size} />);
    else if (weatherId >= 520 && weatherId <= 531) return (<WiRain size={size} />);
    else if (weatherId >= 600 && weatherId <= 699) return (<WiSnowflakeCold size={size} />);
    else if (weatherId >= 700 && weatherId <= 799) return (<WiFog size={size} />);
    else if (weatherId === 800 || weatherId === 801) {
      const curHour = new Date().getHours()
      const isDaytime = (curHour >= 6 && curHour <= 18)

      if (weatherId === 800) return isDaytime ? (<WiDaySunny size={size} />) : (<WiNightClear size={size} />);
      else return isDaytime ? (<WiDayCloudy size={size} />) : (<WiNightCloudy size={size} />);
    } else if (weatherId === 802) return (<WiCloudy size={size} />);
    else if (weatherId === 803 || weatherId === 804) return (<WiCloudy size={size} />);
  };

  const parseCurrentWeather = () => {
    if (!currentWeather) { return; }
    const curWeatherInfo = {
      condition: currentWeather.weather[0].main,
      iconCode: currentWeather.weather[0].id,
      temp: Math.trunc(currentWeather.temp),
      feelsLike: Math.trunc(currentWeather.feels_like),
      humidity: currentWeather.humidity,
      wind: Math.trunc(currentWeather.wind_speed)
    };

    return (
      <Stack direction='column' alignItems='center' justifyContent='center' textAlign='center' mb={4}>
        <Typography variant='h4'>{curWeatherInfo.condition}</Typography>
        {getWeatherIcon(curWeatherInfo.iconCode, 108)}
        <Typography variant='h4'>{curWeatherInfo.temp}°F</Typography>
        <Typography variant='h6'>Feels like {curWeatherInfo.feelsLike}°</Typography>
        <Typography variant='body1'>Humidity: {curWeatherInfo.humidity}%</Typography>
        <Typography variant='body1'>Wind: {curWeatherInfo.wind}mph</Typography>
      </Stack>
    );
  };

  const parseWeatherAlerts = () => {
    if (!weatherAlerts) return;

    let parsedAlerts = [];

    weatherAlerts.forEach(alert => {
      parsedAlerts.push({
        event: alert.event,
        reporter: alert.sender_name,
        description: alert.description
      });
    });

    if (!parsedAlerts) return;

    return (
      <Stack direction='column' alignContent='center' mb={4}>
        {parsedAlerts.map(alert => {
          return (
            <Alert severity='error' key={alert.event}>
              <AlertTitle>{alert.event}</AlertTitle>
              <h5>{alert.reporter}</h5>
              <p>{alert.description}</p>
            </Alert>
          );
        })}
      </Stack>
    );
  };

  const parseHourlyWeather = () => {
    if (!hourlyWeather) return;

    let parsedHourlyReports = [];

    hourlyWeather.forEach(hour => {
      parsedHourlyReports.push({
        hour: new Date(1000 * hour.dt).getHours(),
        iconCode: hour.weather[0].id,
        condition: hour.weather[0].main,
        temp: Math.trunc(hour.temp),
        feelsLike: Math.trunc(hour.feels_like),
        rainChance: hour.pop,
        humidity: hour.humidity
      });
    });

    return (
      <Stack direction='row' alignItems='center' justifyContent='center' spacing={4} mb={4}>
        {parsedHourlyReports.map(rpt => {
          return (
            <Stack direction='column' alignItems='center' justifyContent='center' textAlign='center' width={75} key={rpt.hour} spacing={1}>
              <Typography variant='h6'>{(rpt.hour < 12) ? (`${rpt.hour} AM`) : (`${(rpt.hour === 12) ? rpt.hour : (rpt.hour - 12)} PM`)}</Typography>
              {getWeatherIcon(rpt.iconCode)}
              <Typography variant='h6'>{rpt.condition}</Typography>
              <Typography variant='h6'>{rpt.temp}°F</Typography>
              <Typography variant='body2'>FL {rpt.feelsLike}°</Typography>
              <Typography variant='body2'>HUM: {rpt.humidity}%</Typography>
            </Stack>
          );
        })}
      </Stack>
    );
  };

  const parseDailyWeather = () => {
    if (!dailyWeather) return;

    let parsedDailyReports = [];

    dailyWeather.forEach(day => {
      parsedDailyReports.push({
        day: getDayOfWeek(new Date(1000 * day.dt).getDay()),
        iconCode: day.weather[0].id,
        condition: day.weather[0].main,
        tempHigh: Math.trunc(day.temp.max),
        tempLow: Math.trunc(day.temp.min)
      });
    });

    return (
      <Stack direction='row' alignItems='center' justifyContent='center' spacing={5}>
        {parsedDailyReports.map(rpt => {
          return (
            <Stack direction='column' alignItems='center' justifyContent='center' textAlign='center' key={rpt.day} spacing={1}>
              <Typography variant='h5'>{rpt.day}</Typography>
              {getWeatherIcon(rpt.iconCode)}
              <Typography variant='h6'>{rpt.condition}</Typography>
              <Typography variant='body1'>High: {rpt.tempHigh}°F</Typography>
              <Typography variant='body1'>Low: {rpt.tempLow}°F</Typography>
            </Stack>
          );
        })}
      </Stack>
    );
  };

  useEffect(() => {
    getWeatherData();
  }, []);

  return (
    <Stack alignItems='center' justifyContent='center'>
      <Typography variant='h4'>Weather</Typography>
      <Tabs value={shownWeather} onChange={(e, newVal) => setShownWeather(newVal)}>
        <Tab label='Current' />
        <Tab label='Hourly' />
        <Tab label='Daily' />
      </Tabs>

      {shownWeather === 0 && <>{parseCurrentWeather()}</>}
      {shownWeather === 1 && <>{parseHourlyWeather()}</>}
      {shownWeather === 2 && <>{parseDailyWeather()}</>}

      <>{parseWeatherAlerts()}</>
    </Stack>
  );
}

export default WeatherBox;
