import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, ChevronRight } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
  { id: "all", label: "Tutte" },
  { id: "libera", label: "Libere" },
  { id: "attrezzata", label: "Attrezzate" },
  { id: "family", label: "Family" },
  { id: "giovani", label: "Giovani" },
];

export default function BeachesPage() {
  const navigate = useNavigate();
  const [beaches, setBeaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchBeaches = async () => {
      try {
        const response = await axios.get(`${API}/beaches`);
        setBeaches(response.data);
      } catch (error) {
        console.error("Error fetching beaches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBeaches();
  }, []);

  const filteredBeaches = activeFilter === "all" 
    ? beaches 
    : beaches.filter(b => b.category === activeFilter);

  const recommendedBeaches = beaches.filter(b => b.is_recommended);

  return (
    <div className="px-5 py-6" data-testid="beaches-page">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button variant="ghost" size="icon" onClick={() => navigate("/guida")} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Spiagge & Lidi</h1>
          <p className="text-slate-500 text-sm">Le più belle di Torre Lapillo</p>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <motion.div 
        className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === cat.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Recommended Carousel */}
      {activeFilter === "all" && recommendedBeaches.length > 0 && (
        <motion.div className="mb-6" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Consigliate</h3>
          <div className="horizontal-scroll">
            {recommendedBeaches.map((beach) => (
              <Card 
                key={beach.id}
                className="w-64 flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-100 cursor-pointer interactive-card"
                onClick={() => navigate(`/spiagge/${beach.id}`)}
              >
                <div className="relative h-32">
                  <img src={beach.image_url} alt={beach.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 badge-recommended">Top</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900">{beach.name}</h4>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{beach.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {beach.distance}
                    </span>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Beaches List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBeaches.map((beach, index) => (
            <motion.div
              key={beach.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index + 0.2 }}
            >
              <Card 
                className="flex overflow-hidden rounded-2xl bg-white border border-slate-100 cursor-pointer interactive-card"
                onClick={() => navigate(`/spiagge/${beach.id}`)}
              >
                <img src={beach.image_url} alt={beach.name} className="w-24 h-24 object-cover" />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{beach.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{beach.category}</p>
                    </div>
                    {beach.is_recommended && <span className="badge-recommended text-xs">Top</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{beach.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {beach.distance}
                    </span>
                    <span className="text-xs text-amber-600 font-medium">Dettagli →</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
