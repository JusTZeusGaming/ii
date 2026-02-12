import { useNavigate, useSearchParams } from "react-router-dom";
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
  CloudSun
} from "lucide-react";

const quickActions = [
  { icon: Umbrella, label: "Spiagge & Lidi", to: "/spiagge", color: "bg-blue-500" },
  { icon: Utensils, label: "Dove mangiare", to: "/ristoranti", color: "bg-orange-500" },
  { icon: Compass, label: "Cosa fare oggi", to: "/attivita", color: "bg-emerald-500" },
  { icon: Map, label: "Mappe & Info", to: "/mappe", color: "bg-purple-500" },
  { icon: Bus, label: "Senza auto", to: "/trasporti", color: "bg-rose-500" },
  { icon: Bike, label: "Noleggi", to: "/noleggi", color: "bg-amber-500" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const struttura = searchParams.get("struttura") || "casa-brezza";

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

      {/* Main Accommodation Card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card 
          className="bg-slate-900 text-white p-5 rounded-2xl cursor-pointer interactive-card mb-5"
          onClick={() => navigate(`/alloggio?struttura=${struttura}`)}
          data-testid="accommodation-card"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Il tuo alloggio</h2>
                <p className="text-slate-400 text-sm mt-0.5">Casa Brezza</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Wi-Fi", "Check-in/out", "Regole", "Contatti", "FAQ"].map((tag) => (
              <span 
                key={tag}
                className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Sponsor Bar */}
      <motion.div 
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 rounded-xl bg-white border border-slate-100 cursor-pointer interactive-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Supermercato</p>
              <p className="text-xs text-green-600 font-medium">Aperto • 300m</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-xl bg-white border border-slate-100 cursor-pointer interactive-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CloudSun className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Meteo</p>
              <p className="text-xs text-blue-600 font-medium">28°C Soleggiato</p>
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
                transition={{ delay: 0.1 * index + 0.3 }}
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
