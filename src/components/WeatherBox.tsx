import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  WiRain,
  WiThunderstorm,
  WiSnowflakeCold,
  WiFog,
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiCloudy,
  WiNightCloudy,
} from 'react-icons/wi';
import { UserContext } from 'providers/AppProvider';
import { FirebaseContext } from 'providers/FirebaseProvider';
import {
  ICurrentWeatherResponse,
  IDailyWeatherResponse,
  IHourlyWeatherResponse,
  IParsedCurrentWeather,
  IParsedDailyWeather,
  IParsedHourlyWeather,
  IWeatherAlertResponse,
} from 'models/weatherTypes';

const WeatherBox = (): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const { profile, family, getFamily } = useContext(UserContext);
  const [currentWeather, setCurrentWeather] = useState<IParsedCurrentWeather | undefined>(undefined);
  const [hourlyWeather, setHourlyWeather] = useState<IParsedHourlyWeather[] | undefined>(undefined);
  const [dailyWeather, setDailyWeather] = useState<IParsedDailyWeather[] | undefined>(undefined);
  const [weatherAlerts, setWeatherAlerts] = useState<IWeatherAlertResponse[] | undefined>(undefined);
  const [shownWeather, setShownWeather] = useState(0);
  const [isFetchingWeather, setIsFetchingWeather] = useState(true);

  const [settingApiKey, setSettingApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  const getWeatherData = () => {
    if (!family?.location || !family?.openweathermap_api_key) return;

    setIsFetchingWeather(true);
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${family.location.lat}&lon=${family.location.long}&exclude=minutely&appid=${family.openweathermap_api_key}&units=imperial`; // Exclude minute-ly forecast

    axios
      .get(url)
      .then((resp) => {
        setIsFetchingWeather(false);

        if (resp.data) {
          // Get current weather
          const currentWeatherResponse = resp.data.current as ICurrentWeatherResponse;
          const newCurrentWeather: IParsedCurrentWeather = {
            condition: currentWeatherResponse.weather[0].main,
            iconCode: currentWeatherResponse.weather[0].id,
            temp: Math.trunc(currentWeatherResponse.temp),
            feelsLike: Math.trunc(currentWeatherResponse.feels_like),
            humidity: currentWeatherResponse.humidity,
            wind: Math.trunc(currentWeatherResponse.wind_speed),
          };
          setCurrentWeather(newCurrentWeather);

          // Get alerts (if any)
          if (resp.data.alerts) {
            setWeatherAlerts(resp.data.alerts as IWeatherAlertResponse[]);
          }

          // Get next 12 hours
          const newHourlyWeather: IParsedHourlyWeather[] = (resp.data.hourly as IHourlyWeatherResponse[])
            .slice(1, 13)
            .map((hour) => ({
              hour: new Date(1000 * hour.dt).getHours(),
              iconCode: hour.weather[0].id,
              condition: hour.weather[0].main,
              temp: Math.trunc(hour.temp),
              feelsLike: Math.trunc(hour.feels_like),
              rainChance: hour.pop,
              humidity: hour.humidity,
            }));
          setHourlyWeather(newHourlyWeather);

          // Get next 5 days
          const newDailyWeather: IParsedDailyWeather[] = (resp.data.daily as IDailyWeatherResponse[])
            .slice(1, 6)
            .map((day) => ({
              day: getDayOfWeek(new Date(1000 * day.dt).getDay()),
              iconCode: day.weather[0].id,
              condition: day.weather[0].main,
              tempHigh: Math.trunc(day.temp.max),
              tempLow: Math.trunc(day.temp.min),
            }));
          setDailyWeather(newDailyWeather);
        } else {
          console.error('Error: weather data missing');
        }
      })
      .catch((err) => {
        console.error('Error getting weather: ' + err);
      });
  };

  const getDayOfWeek = (dayNum: number) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (dayNum >= 0 && dayNum <= 6) {
      return daysOfWeek[dayNum];
    } else {
      const errStr = 'ERROR: Incorrect day of week';
      console.error(errStr);
      return errStr;
    }
  };

  const getWeatherIcon = (weatherId: number, size = 48) => {
    if (weatherId >= 200 && weatherId <= 299) return <WiThunderstorm size={size} />;
    else if (weatherId >= 300 && weatherId <= 399) return <WiRain size={size} />;
    else if (weatherId >= 500 && weatherId <= 504) return <WiRain size={size} />;
    else if (weatherId === 511) return <WiSnowflakeCold size={size} />;
    else if (weatherId >= 520 && weatherId <= 531) return <WiRain size={size} />;
    else if (weatherId >= 600 && weatherId <= 699) return <WiSnowflakeCold size={size} />;
    else if (weatherId >= 700 && weatherId <= 799) return <WiFog size={size} />;
    else if (weatherId === 800 || weatherId === 801) {
      const curHour = new Date().getHours();
      const isDaytime = curHour >= 6 && curHour <= 18;

      if (weatherId === 800) return isDaytime ? <WiDaySunny size={size} /> : <WiNightClear size={size} />;
      else return isDaytime ? <WiDayCloudy size={size} /> : <WiNightCloudy size={size} />;
    } else if (weatherId === 802) return <WiCloudy size={size} />;
    else if (weatherId === 803 || weatherId === 804) return <WiCloudy size={size} />;
  };

  const parseCurrentWeather = () => {
    if (!currentWeather) return;

    return (
      <Paper>
        <Stack
          direction='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          mt={3}
          pl={5}
          pr={5}
          pt={2}
          pb={2}
        >
          <Typography variant='h4'>{currentWeather.condition}</Typography>
          {getWeatherIcon(currentWeather.iconCode, 108)}
          <Typography variant='h4'>{currentWeather.temp}°F</Typography>
          <Typography variant='h6'>Feels like {currentWeather.feelsLike}°</Typography>
          <Typography variant='body1'>Humidity: {currentWeather.humidity}%</Typography>
          <Typography variant='body1'>Wind: {currentWeather.wind}mph</Typography>
        </Stack>
      </Paper>
    );
  };

  const parseWeatherAlerts = () => {
    if (!weatherAlerts) return;

    return (
      <Stack direction='column' alignContent='center' mb={4} mt={2}>
        {weatherAlerts.map((alert) => {
          return (
            <Alert severity='error' key={alert.event}>
              <AlertTitle>{alert.event}</AlertTitle>
              <h5>{alert.sender_name}</h5>
              <p>{alert.description}</p>
            </Alert>
          );
        })}
      </Stack>
    );
  };

  const parseHourlyWeather = () => {
    if (!hourlyWeather) return;

    return (
      <Stack spacing={1} mt={2}>
        {hourlyWeather.map((rpt) => {
          return (
            <Paper key={rpt.hour}>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-evenly'
                textAlign='center'
                width={{ xs: '95vw', sm: '60vw', md: '35vw', lg: '25vw' }}
                key={rpt.hour}
              >
                <Typography variant='subtitle1'>
                  {rpt.hour < 12 ? `${rpt.hour} AM` : `${rpt.hour === 12 ? rpt.hour : rpt.hour - 12} PM`}
                </Typography>

                <Stack>
                  {getWeatherIcon(rpt.iconCode)}
                  <Typography variant='subtitle2'>{rpt.condition}</Typography>
                </Stack>

                <Typography variant='h6'>{rpt.temp}°F</Typography>

                <Stack>
                  <Typography variant='subtitle2'>Feels like: {rpt.feelsLike}°</Typography>
                  <Typography variant='subtitle2'>Humidity: {rpt.humidity}%</Typography>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  const parseDailyWeather = () => {
    if (!dailyWeather) return;

    return (
      <Stack spacing={2} m={2}>
        {dailyWeather.map((rpt) => {
          return (
            <Paper key={rpt.day}>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-evenly'
                textAlign='center'
                width={{ xs: '95vw', sm: '60vw', md: '35vw', lg: '25vw' }}
                key={rpt.day}
              >
                <Typography variant='h6'>{rpt.day}</Typography>

                <Stack>
                  {getWeatherIcon(rpt.iconCode)}
                  <Typography variant='subtitle1'>{rpt.condition}</Typography>
                </Stack>

                <Stack>
                  <Typography variant='body1'>High: {rpt.tempHigh}°F</Typography>
                  <Typography variant='body1'>Low: {rpt.tempLow}°F</Typography>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  const saveApiKey = () => {
    if (!profile) return;

    firebase
      .updateFamily(profile.familyId, {
        openweathermap_api_key: newApiKey,
      })
      .then(() => {
        getFamily();
      });
  };

  useEffect(getWeatherData, [family]);

  if (!family?.openweathermap_api_key) {
    return (
      <Box textAlign='center' maxWidth='sm' mx='auto'>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h5' mb={1}>
            Want to see the weather here?
          </Typography>
          <Typography variant='subtitle1' mb={3}>
            Obtain a free &apos;Current Weather&apos; API key from OpenWeatherMap (https://openweathermap.org/price),
            input it below, then set your family location on your profile page
          </Typography>

          <Button variant='contained' onClick={() => setSettingApiKey(true)}>
            Set API Key
          </Button>

          <Dialog open={settingApiKey} onClose={() => setSettingApiKey(false)} fullWidth>
            <DialogTitle>Set Weather API Key</DialogTitle>

            <DialogContent>
              <TextField
                autoFocus
                variant='standard'
                label='API Key'
                value={newApiKey}
                onChange={(event) => setNewApiKey(event.target.value)}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setSettingApiKey(false)}>Cancel</Button>
              <Button variant='contained' onClick={saveApiKey}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    );
  }

  return (
    <Stack alignItems='center' justifyContent='center' mb={6}>
      <Typography variant='h4'>Weather</Typography>
      <Tabs value={shownWeather} onChange={(e, newVal) => setShownWeather(newVal)}>
        <Tab label='Current' />
        <Tab label='Hourly' />
        <Tab label='Daily' />
      </Tabs>

      {isFetchingWeather ? (
        <Box mx='auto' textAlign='center' mt={20}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {shownWeather === 0 && <>{parseCurrentWeather()}</>}
          {shownWeather === 1 && <>{parseHourlyWeather()}</>}
          {shownWeather === 2 && <>{parseDailyWeather()}</>}

          {parseWeatherAlerts()}
        </Box>
      )}
    </Stack>
  );
};

export default WeatherBox;
