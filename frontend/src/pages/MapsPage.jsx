import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ExternalLink,
  Car,
  Pill,
  Stethoscope,
  Hospital,
  Train,
  Anchor
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  car: Car,
  pill: Pill,
  stethoscope: Stethoscope,
  hospital: Hospital,
  train: Train,
  anchor: Anchor
};

const categoryLabels = {
  parcheggi: "Parcheggi",
  farmacia: "Farmacia",
  guardia_medica: "Guardia Medica",
  pronto_soccorso: "Pronto Soccorso",
  stazioni: "Stazioni",
  porti: "Porti"
};

export default function MapsPage() {
  const navigate = useNavigate();
  const [mapInfo, setMapInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapInfo = async () => {
      try {
        const response = await axios.get(`${API}/map-info`);
        setMapInfo(response.data);
      } catch (error) {
        console.error("Error fetching map info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMapInfo();
  }, []);

  // Group by category
  const groupedInfo = mapInfo.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="px-5 py-6" data-testid="maps-page">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/guida")}
          className="rounded-full"
          data-testid="back-button"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("maps.title")}</h1>
          <p className="text-slate-500 text-sm">{t("maps.subtitle")}</p>
        </div>
      </motion.div>

      {/* Info Cards by Category */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInfo).map(([category, items], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * categoryIndex }}
            >
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-3">
                {items.map((item) => {
                  const Icon = iconMap[item.icon] || Car;
                  return (
                    <Card 
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100"
                      data-testid={`map-item-${item.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900">{item.name}</h4>
                          <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.map_url, "_blank")}
                            className="text-amber-600 hover:text-amber-700 p-0 h-auto text-xs mt-2"
                            data-testid={`map-open-${item.id}`}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Apri mappa
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
