import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DiningPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const categories = [
    { id: "all", label: t("dining.all") },
    { id: "pesce", label: t("dining.fish") },
    { id: "carne", label: t("dining.meat") },
    { id: "pizzeria", label: t("dining.pizza") },
    { id: "colazione", label: t("dining.breakfast") },
  ];

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`${API}/restaurants`);
        setRestaurants(response.data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filteredRestaurants = activeFilter === "all" 
    ? restaurants 
    : restaurants.filter(r => r.category === activeFilter);

  const recommendedRestaurants = restaurants.filter(r => r.is_recommended);

  return (
    <div className="px-5 py-6" data-testid="dining-page">
      {/* Header */}
      <motion.div className="flex items-center gap-3 mb-6" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Button variant="ghost" size="icon" onClick={() => navigate("/guida")} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("dining.title")}</h1>
          <p className="text-slate-500 text-sm">{t("dining.subtitle")}</p>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <motion.div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === cat.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Recommended Carousel */}
      {activeFilter === "all" && recommendedRestaurants.length > 0 && (
        <motion.div className="mb-6" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t("dining.recommended")}</h3>
          <div className="horizontal-scroll">
            {recommendedRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id}
                className="w-72 flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-100 cursor-pointer interactive-card"
                onClick={() => navigate(`/ristoranti/${restaurant.id}`)}
              >
                <div className="relative h-36">
                  <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 badge-recommended">{t("recommended")}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900">{restaurant.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-amber-600 font-medium capitalize">{restaurant.category}</p>
                    <span className="text-slate-300">•</span>
                    <p className="text-xs text-slate-500">{restaurant.price_range}</p>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{restaurant.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />)}
                    </div>
                    <span className="text-xs text-amber-600 font-medium">{t("book")} →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Restaurants List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (<div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index + 0.2 }}
            >
              <Card 
                className="flex overflow-hidden rounded-2xl bg-white border border-slate-100 cursor-pointer interactive-card"
                onClick={() => navigate(`/ristoranti/${restaurant.id}`)}
              >
                <img src={restaurant.image_url} alt={restaurant.name} className="w-28 h-28 object-cover" />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{restaurant.name}</h4>
                      <p className="text-xs text-amber-600 font-medium capitalize">{restaurant.category} • {restaurant.price_range}</p>
                    </div>
                    {restaurant.is_recommended && <span className="badge-recommended text-xs">Top</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{restaurant.description}</p>
                  <div className="flex items-center justify-end mt-2">
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      Prenota <ChevronRight className="w-3 h-3" />
                    </span>
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
