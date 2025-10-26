import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudDrizzle, Sun, Wind, Droplets, AlertTriangle } from 'lucide-react';
import { cacheWeatherData, getCachedWeather } from '../utils/offlineStorage';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      // Using Kuala Lumpur coordinates as default (Malaysia)
      // You can change this to specific farm location
      const lat = 3.1390;
      const lon = 101.6869;

      if (navigator.onLine) {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia/Singapore&forecast_days=3`
        );

        const data = await response.json();
        setWeather(data);
        // Cache weather data for offline access
        await cacheWeatherData(data);
      } else {
        // Load cached weather data when offline
        const cached = await getCachedWeather();
        if (cached) {
          setWeather(cached);
        }
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Try to load cached data on error
      const cached = await getCachedWeather();
      if (cached) {
        setWeather(cached);
      }
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    // Weather codes from Open-Meteo
    if (code === 0) return <Sun className="text-yellow-500" size={32} />;
    if (code <= 3) return <Cloud className="text-gray-500" size={32} />;
    if (code <= 67) return <CloudDrizzle className="text-blue-400" size={32} />;
    if (code <= 99) return <CloudRain className="text-blue-600" size={32} />;
    return <Cloud className="text-gray-400" size={32} />;
  };

  const getWeatherText = (code) => {
    if (code === 0) return 'Cerah';
    if (code === 1) return 'Kebanyakannya Cerah';
    if (code === 2) return 'Berawan Separa';
    if (code === 3) return 'Mendung';
    if (code <= 67) return 'Hujan Renyai';
    if (code <= 82) return 'Hujan';
    if (code <= 99) return 'Hujan Lebat';
    return 'Tidak Diketahui';
  };

  const getSprayRecommendation = () => {
    if (!weather?.current) return null;

    const { precipitation, wind_speed_10m } = weather.current;
    const tomorrow = weather.daily.precipitation_sum[1];

    if (precipitation > 0) {
      return {
        type: 'danger',
        message: 'JANGAN SPRAY! Sedang hujan sekarang',
        icon: <AlertTriangle className="text-red-500" size={20} />
      };
    }

    if (tomorrow > 5) {
      return {
        type: 'warning',
        message: 'Mungkin hujan esok. Pertimbangkan delay spray',
        icon: <AlertTriangle className="text-yellow-500" size={20} />
      };
    }

    if (wind_speed_10m > 15) {
      return {
        type: 'warning',
        message: 'Angin kuat. Tidak ideal untuk spray',
        icon: <Wind className="text-yellow-500" size={20} />
      };
    }

    return {
      type: 'success',
      message: 'Cuaca sesuai untuk spray!',
      icon: <Droplets className="text-green-500" size={20} />
    };
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="card">
        <p className="text-gray-500">Weather data unavailable</p>
      </div>
    );
  }

  const recommendation = getSprayRecommendation();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cuaca Hari Ini</h3>
        <span className="text-xs text-gray-500">Kuala Lumpur</span>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {getWeatherIcon(weather.current.weather_code)}
          <div>
            <div className="text-4xl font-bold">{Math.round(weather.current.temperature_2m)}°C</div>
            <div className="text-sm text-gray-600">{getWeatherText(weather.current.weather_code)}</div>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Droplets size={16} />
            <span>{weather.current.relative_humidity_2m}%</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <Wind size={16} />
            <span>{Math.round(weather.current.wind_speed_10m)} km/h</span>
          </div>
        </div>
      </div>

      {/* Spray Recommendation */}
      {recommendation && (
        <div className={`p-3 rounded-lg flex items-center gap-3 mb-4 ${
          recommendation.type === 'danger' ? 'bg-red-50 border border-red-200' :
          recommendation.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-green-50 border border-green-200'
        }`}>
          {recommendation.icon}
          <span className={`text-sm font-medium ${
            recommendation.type === 'danger' ? 'text-red-700' :
            recommendation.type === 'warning' ? 'text-yellow-700' :
            'text-green-700'
          }`}>
            {recommendation.message}
          </span>
        </div>
      )}

      {/* 3-Day Forecast */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">3 Hari Depan</h4>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((day) => {
            const date = new Date();
            date.setDate(date.getDate() + day);
            const dayName = date.toLocaleDateString('ms-MY', { weekday: 'short' });

            return (
              <div key={day} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs font-medium text-gray-600 mb-1">{dayName}</div>
                <div className="flex justify-center mb-1">
                  {getWeatherIcon(weather.daily.weather_code[day])}
                </div>
                <div className="text-xs">
                  <span className="font-semibold">{Math.round(weather.daily.temperature_2m_max[day])}°</span>
                  <span className="text-gray-500"> / {Math.round(weather.daily.temperature_2m_min[day])}°</span>
                </div>
                {weather.daily.precipitation_sum[day] > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    <CloudRain size={12} className="inline" /> {Math.round(weather.daily.precipitation_sum[day])}mm
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        Updated: {new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default WeatherWidget;
