import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind,
  Droplets,
  ThermometerSun,
  Compass,
  Eye,
  Sunrise,
  Sunset,
  CloudSun,
  CloudMoon,
  CloudSnow,
  CloudLightning,
  CloudFog
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Weather code to icon mapping
const getWeatherIcon = (code, isNight = false) => {
  if (code === 0) return isNight ? CloudMoon : Sun;
  if (code <= 3) return CloudSun;
  if (code <= 48) return CloudFog;
  if (code <= 67) return CloudRain;
  if (code <= 77) return CloudSnow;
  if (code <= 82) return CloudRain;
  if (code >= 95) return CloudLightning;
  return Cloud;
};

const getWeatherDescription = (code) => {
  if (code === 0) return "Sereno";
  if (code <= 3) return "Parzialmente nuvoloso";
  if (code <= 48) return "Nebbia";
  if (code <= 55) return "Pioggia leggera";
  if (code <= 67) return "Pioggia";
  if (code <= 77) return "Neve";
  if (code <= 82) return "Pioggia intensa";
  if (code >= 95) return "Temporale";
  return "Nuvoloso";
};

export default function WeatherPage() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(`${API}/weather/detailed`);
        setWeather(response.data);
      } catch (error) {
        // Fallback to basic weather
        try {
          const basicResponse = await axios.get(`${API}/weather`);
          setWeather({ current: basicResponse.data, hourly: [], daily: [] });
        } catch (e) {
          console.error("Error:", e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const formatHour = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDay = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="px-5 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const current = weather?.current || {};
  const hourly = weather?.hourly || [];
  const daily = weather?.daily || [];
  const CurrentIcon = getWeatherIcon(current.weather_code || 0);

  return (
    <div className="px-5 py-6" data-testid="weather-page">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meteo Torre Lapillo</h1>
          <p className="text-slate-500 text-sm">Previsioni dettagliate</p>
        </div>
      </motion.div>

      {/* Current Weather Card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Adesso</p>
              <p className="text-5xl font-bold">{current.temperature || "--"}°</p>
              <p className="text-white/90 mt-1">{getWeatherDescription(current.weather_code)}</p>
            </div>
            <CurrentIcon className="w-20 h-20 text-white/90" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
            <div className="text-center">
              <Wind className="w-5 h-5 mx-auto text-white/70" />
              <p className="text-lg font-semibold mt-1">{current.wind_speed || 0} km/h</p>
              <p className="text-xs text-white/60">Vento</p>
            </div>
            <div className="text-center">
              <Droplets className="w-5 h-5 mx-auto text-white/70" />
              <p className="text-lg font-semibold mt-1">{current.humidity || 0}%</p>
              <p className="text-xs text-white/60">Umidità</p>
            </div>
            <div className="text-center">
              <Eye className="w-5 h-5 mx-auto text-white/70" />
              <p className="text-lg font-semibold mt-1">{current.visibility ? (current.visibility / 1000).toFixed(0) : "--"} km</p>
              <p className="text-xs text-white/60">Visibilità</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Hourly Forecast */}
      {hourly.length > 0 && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Prossime ore</h3>
          <Card className="p-4 rounded-2xl">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {hourly.slice(0, 12).map((hour, index) => {
                const HourIcon = getWeatherIcon(hour.weather_code, hour.is_night);
                return (
                  <div key={index} className="flex-shrink-0 text-center min-w-[60px]">
                    <p className="text-xs text-slate-500">{formatHour(hour.time)}</p>
                    <HourIcon className="w-8 h-8 mx-auto my-2 text-slate-600" />
                    <p className="font-semibold text-slate-900">{hour.temperature}°</p>
                    {hour.precipitation_probability > 0 && (
                      <p className="text-xs text-blue-500">{hour.precipitation_probability}%</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Daily Forecast */}
      {daily.length > 0 && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Prossimi giorni</h3>
          <Card className="rounded-2xl overflow-hidden">
            {daily.map((day, index) => {
              const DayIcon = getWeatherIcon(day.weather_code);
              return (
                <div 
                  key={index} 
                  className={`flex items-center p-4 ${index !== daily.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <p className="w-16 text-sm font-medium text-slate-600">{formatDay(day.date)}</p>
                  <DayIcon className="w-8 h-8 text-slate-500 mx-4" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">{getWeatherDescription(day.weather_code)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{day.temp_max}°</p>
                    <p className="text-sm text-slate-400">{day.temp_min}°</p>
                  </div>
                </div>
              );
            })}
          </Card>
        </motion.div>
      )}

      {/* Beach Tip */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Card className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex gap-3">
            <Sun className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800">Consiglio del giorno</h4>
              <p className="text-sm text-amber-700 mt-1">
                {current.temperature >= 28 
                  ? "Giornata calda! Porta tanta acqua e cerca ombra nelle ore centrali."
                  : current.temperature >= 22
                  ? "Temperatura ideale per la spiaggia. Buona giornata!"
                  : current.weather_code <= 3
                  ? "Bel tempo ma freschetto. Porta una giacchetta leggera per la sera."
                  : "Tempo variabile. Controlla il meteo prima di andare in spiaggia."
                }
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
