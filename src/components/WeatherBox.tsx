import {
    Alert,
    AlertDescription,
    AlertTitle,
    Box,
    CircularProgress,
    Container,
    Heading,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import {
    WiCloudy,
    WiDayCloudy,
    WiDaySunny,
    WiFog,
    WiNightClear,
    WiNightCloudy,
    WiRain,
    WiSnowflakeCold,
    WiThunderstorm,
} from 'react-icons/wi';
import { daysOfTheWeek, openWeatherMapGeocodeApiBaseUrl, openWeatherMapOneCallApiBaseUrl } from '../constants';
import {
    IGeocodeResponse,
    IParsedCurrentWeather,
    IParsedDailyWeather,
    IParsedHourlyWeather,
    IWeatherAlertResponse,
    IWeatherResponse,
} from '../models/weatherTypes';
import { useUserStore } from '../state/UserStore';

type DayNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const getDayOfWeek = (dayNum: DayNum) => daysOfTheWeek[dayNum];

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

const WeatherBox = () => {
    const family = useUserStore((state) => state.family);

    const [weatherLocation, setWeatherLocation] = useState<string | undefined>(undefined);
    const [currentWeather, setCurrentWeather] = useState<IParsedCurrentWeather | undefined>(undefined);
    const [hourlyWeather, setHourlyWeather] = useState<IParsedHourlyWeather[] | undefined>(undefined);
    const [dailyWeather, setDailyWeather] = useState<IParsedDailyWeather[] | undefined>(undefined);
    const [weatherAlerts, setWeatherAlerts] = useState<IWeatherAlertResponse[] | undefined>(undefined);

    const getGeoDataFromCityState = async (): Promise<IGeocodeResponse | undefined> => {
        if (!family?.cityState) {
            return undefined;
        }

        const geocodeResponseLimit = 1;
        const defaultCountryCode = 'US'; // Currently just supports United States (US)
        const geocodeUrl = `${openWeatherMapGeocodeApiBaseUrl}?q=${
            family.cityState
        },${defaultCountryCode}&limit=${geocodeResponseLimit}&appid=${import.meta.env.VITE_OWM_API_KEY}`;

        const geocodeResponse = await axios.get(geocodeUrl);
        const geocodeData = geocodeResponse.data[0] as IGeocodeResponse;

        return geocodeData;
    };

    const getWeatherData = async (geocodeData?: IGeocodeResponse): Promise<IWeatherResponse | undefined> => {
        if (!geocodeData) {
            return undefined;
        }

        // Exclude minute-ly forecast
        const fullUrl = `${openWeatherMapOneCallApiBaseUrl}?lat=${geocodeData.lat}&lon=${
            geocodeData.lon
        }&exclude=minutely&appid=${import.meta.env.VITE_OWM_API_KEY}&units=imperial`;

        return (await axios.get(fullUrl)).data as IWeatherResponse;
    };

    const geocodeDataQuery = useQuery(['geocodeData-', family?.cityState ?? 'undefined'], getGeoDataFromCityState, {
        enabled: !!family?.cityState,
    });
    const weatherDataQuery = useQuery(
        ['weatherData-', family?.cityState ?? 'undefined'],
        () => getWeatherData(geocodeDataQuery.data),
        { enabled: !!family?.cityState && !!geocodeDataQuery.data }
    );

    const processAndSetWeather = useCallback(async () => {
        const geocodeData = geocodeDataQuery.data;

        if (!geocodeData) return;

        setWeatherLocation(`${geocodeData.name}${geocodeData.state ? `, ${geocodeData.state}` : ''}`);

        const weatherData = weatherDataQuery.data;

        if (!weatherData) return;

        // Compile current weather
        const currentWeatherResponse = weatherData.current;
        const newCurrentWeather: IParsedCurrentWeather = {
            condition: currentWeatherResponse.weather[0].main,
            iconCode: currentWeatherResponse.weather[0].id,
            temp: Math.trunc(currentWeatherResponse.temp),
            feelsLike: Math.trunc(currentWeatherResponse.feels_like),
            humidity: currentWeatherResponse.humidity,
            wind: Math.trunc(currentWeatherResponse.wind_speed),
        };
        setCurrentWeather(newCurrentWeather);

        // Compile alerts (if any)
        if (weatherData.alerts) {
            setWeatherAlerts(weatherData.alerts);
        }

        // Compile next 12 hours
        const newHourlyWeather: IParsedHourlyWeather[] = weatherData.hourly.slice(1, 13).map((hour) => ({
            hour: new Date(1000 * hour.dt).getHours(),
            iconCode: hour.weather[0].id,
            condition: hour.weather[0].main,
            temp: Math.trunc(hour.temp),
            feelsLike: Math.trunc(hour.feels_like),
            rainChance: hour.pop,
            humidity: hour.humidity,
        }));
        setHourlyWeather(newHourlyWeather);

        // Compile next 5 days
        const newDailyWeather: IParsedDailyWeather[] = weatherData.daily.slice(1, 6).map((day) => ({
            day: getDayOfWeek(new Date(1000 * day.dt).getDay() as DayNum),
            iconCode: day.weather[0].id,
            condition: day.weather[0].main,
            tempHigh: Math.trunc(day.temp.max),
            tempLow: Math.trunc(day.temp.min),
        }));
        setDailyWeather(newDailyWeather);
    }, [geocodeDataQuery.data, weatherDataQuery.data]);

    useEffect(() => {
        processAndSetWeather();
    }, [weatherDataQuery.data, processAndSetWeather]);

    return (
        <Stack alignItems='center' justifyContent='center' mb={6}>
            <Heading>Weather</Heading>
            <Text fontSize='lg'>{weatherLocation}</Text>

            {geocodeDataQuery.isLoading || weatherDataQuery.isLoading ? (
                <Box mx='auto' textAlign='center' mt={20}>
                    <CircularProgress isIndeterminate />

                    <Text>Checking the weather...</Text>
                </Box>
            ) : (
                <Tabs isFitted>
                    <TabList>
                        <Tab>Current</Tab>
                        <Tab>Hourly</Tab>
                        <Tab>Daily</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            {currentWeather && (
                                <Container centerContent>
                                    <Heading size='md'>{currentWeather.condition}</Heading>
                                    <Text fontSize='xl'>{currentWeather.temp}°F</Text>
                                    <Container centerContent>{getWeatherIcon(currentWeather.iconCode, 108)}</Container>
                                    <Text>Feels like: {currentWeather.feelsLike}°F</Text>
                                    <Text>Humidity: {currentWeather.humidity}%</Text>
                                    <Text>Wind: {currentWeather.wind}mph</Text>
                                </Container>
                            )}
                        </TabPanel>

                        <TabPanel>
                            <Stack spacing={3} mt={2}>
                                {hourlyWeather?.map((rpt) => (
                                    <Stack key={rpt.hour} direction='row' alignItems='center'>
                                        <Heading size='sm' mr='auto'>
                                            {rpt.hour < 12
                                                ? `${rpt.hour} AM`
                                                : `${rpt.hour === 12 ? rpt.hour : rpt.hour - 12} PM`}
                                        </Heading>

                                        <Text ml='auto'>{rpt.temp}°F</Text>

                                        <Stack
                                            direction='column'
                                            justifyContent='space-around'
                                            alignItems='center'
                                            spacing={0}
                                        >
                                            <Container centerContent mb={-1}>
                                                {getWeatherIcon(rpt.iconCode)}
                                            </Container>
                                            <Heading size='xs'>{rpt.condition}</Heading>
                                        </Stack>

                                        <Stack
                                            direction='column'
                                            justifyContent='space-around'
                                            alignItems='center'
                                            spacing={0}
                                        >
                                            <Text fontSize='sm'>FL: {rpt.feelsLike}°F</Text>
                                            <Text fontSize='sm'>HUM: {rpt.humidity}%</Text>
                                        </Stack>
                                    </Stack>
                                ))}
                            </Stack>
                        </TabPanel>

                        <TabPanel>
                            <Stack spacing={3} m={2}>
                                {dailyWeather?.map((rpt) => (
                                    <Stack key={rpt.day} direction='row' alignItems='center'>
                                        <Heading size='sm' mr='auto'>
                                            {rpt.day}
                                        </Heading>

                                        <Stack
                                            direction='column'
                                            justifyContent='space-around'
                                            alignItems='center'
                                            spacing={0}
                                            ml='auto'
                                        >
                                            <Container centerContent mb={-1}>
                                                {getWeatherIcon(rpt.iconCode)}
                                            </Container>
                                            <Heading size='xs'>{rpt.condition}</Heading>
                                        </Stack>

                                        <Stack
                                            direction='column'
                                            justifyContent='space-around'
                                            alignItems='center'
                                            spacing={0}
                                        >
                                            <Text>High: {rpt.tempHigh}°F</Text>
                                            <Text>Low: {rpt.tempLow}°F</Text>
                                        </Stack>
                                    </Stack>
                                ))}
                            </Stack>
                        </TabPanel>

                        {weatherAlerts && (
                            <Stack direction='column' alignContent='center' mb={4} mt={2}>
                                {weatherAlerts.map((alert) => (
                                    <Alert status='error' key={alert.event}>
                                        <AlertTitle>{alert.event}</AlertTitle>
                                        <h5>{alert.sender_name}</h5>

                                        <AlertDescription>{alert.description}</AlertDescription>
                                    </Alert>
                                ))}
                            </Stack>
                        )}
                    </TabPanels>
                </Tabs>
            )}
        </Stack>
    );
};

export default WeatherBox;
