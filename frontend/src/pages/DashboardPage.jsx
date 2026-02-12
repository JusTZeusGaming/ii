import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  Umbrella, 
  Utensils, 
  Compass, 
  Map, 
  Bus, 
  Bike,
  ChevronRight,
  ShoppingCart,
  Sun,
  Cloud,
  CloudRain,
  Wind
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const quickActions = [
  { icon: Umbrella, label: "Spiagge & Lidi", to: "/spiagge", color: "bg-blue-500" },
  { icon: Utensils, label: "Dove mangiare", to: "/ristoranti", color: "bg-orange-500" },
  { icon: Compass, label: "Cosa fare oggi", to: "/attivita", color: "bg-emerald-500" },
  { icon: Map, label: "Mappe & Info", to: "/mappe", color: "bg-purple-500" },
  { icon: Bus, label: "Senza auto", to: "/trasporti", color: "bg-rose-500" },
  { icon: Bike, label: "Noleggi", to: "/noleggi", color: "bg-amber-500" },
];

const WeatherIcon = ({ icon }) => {
  const icons = {
    "sun": Sun,
    "cloud": Cloud,
    "cloud-sun": Cloud,
    "cloud-rain": CloudRain,
    "cloud-drizzle": CloudRain,
    "cloud-fog": Cloud,
    "cloud-lightning": CloudRain
  };
  const Icon = icons[icon] || Sun;
  return <Icon className="w-4 h-4" />;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const struttura = searchParams.get("struttura") || "casa-brezza";
  const [property, setProperty] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, weatherRes] = await Promise.all([
          axios.get(`${API}/properties/${struttura}`),
          axios.get(`${API}/weather`)
        ]);
        setProperty(propRes.data);
        setWeather(weatherRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [struttura]);

  return (
    <div className="px-5 py-6" data-testid="dashboard-page">
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">Benvenuto/a</h1>
        <p className="text-slate-500 mt-1">Scopri Torre Lapillo e dintorni</p>
      </motion.div>

      {/* Main Accommodation Card with Background */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card 
          className="relative overflow-hidden rounded-2xl cursor-pointer interactive-card mb-5 h-44"
          onClick={() => navigate(`/alloggio?struttura=${struttura}`)}
          data-testid="accommodation-card"
        >
          {/* Background Image */}
          <img 
            src={property?.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
            alt="Alloggio"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/30" />
          
          {/* Weather Badge */}
          {weather && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
              <WeatherIcon icon={weather.icon} />
              <span className="text-sm font-semibold text-slate-900">{weather.temperature}°C</span>
              {weather.wind_speed > 0 && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Wind className="w-3 h-3" />{weather.wind_speed}km/h
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Il tuo alloggio</h2>
                  <p className="text-white/70 text-sm">{property?.name || "Casa Brezza"}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Wi-Fi", "Check-in/out", "Regole", "Contatti", "FAQ"].map((tag) => (
                <span 
                  key={tag}
                  className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Supermarket Sponsor - Full Width */}
      <motion.div 
        className="mb-6"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card 
          className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 cursor-pointer interactive-card"
          onClick={() => navigate("/supermercato")}
          data-testid="supermarket-card"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-slate-900">L'Angolo dei Sapori</p>
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  APERTO
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">Supermercato • Panini • Prodotti tipici</p>
              <p className="text-xs text-green-600 font-medium mt-1">300m • Clicca per info e orari →</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div 
        className="mb-4"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Esplora
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index + 0.3 }}
              >
                <Card
                  className="p-4 rounded-xl bg-white border border-slate-100 cursor-pointer interactive-card"
                  onClick={() => navigate(action.to)}
                  data-testid={`action-${action.to.slice(1)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {action.label}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
