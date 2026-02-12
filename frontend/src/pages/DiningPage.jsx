import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Phone, MessageCircle } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const WHATSAPP_NUMBER = "393293236473";

const categories = [
  { id: "all", label: "Tutti" },
  { id: "pesce", label: "Pesce" },
  { id: "carne", label: "Carne" },
  { id: "pizzeria", label: "Pizzerie" },
  { id: "colazione", label: "Colazione" },
];

export default function DiningPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

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

  const openWhatsApp = (restaurantName) => {
    const message = `Ciao, vorrei prenotare un tavolo al ${restaurantName}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="px-5 py-6" data-testid="dining-page">
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
          <h1 className="text-2xl font-bold text-slate-900">Dove mangiare</h1>
          <p className="text-slate-500 text-sm">I migliori ristoranti della zona</p>
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
            data-testid={`filter-${cat.id}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === cat.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Recommended Carousel */}
      {activeFilter === "all" && recommendedRestaurants.length > 0 && (
        <motion.div 
          className="mb-6"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Consigliati
          </h3>
          <div className="horizontal-scroll">
            {recommendedRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id}
                className="w-72 flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-100"
                data-testid={`restaurant-recommended-${restaurant.id}`}
              >
                <div className="relative h-36">
                  <img 
                    src={restaurant.image_url} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 badge-recommended">
                    Consigliato
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900">{restaurant.name}</h4>
                  <p className="text-xs text-amber-600 font-medium capitalize mt-0.5">
                    {restaurant.category}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {restaurant.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${restaurant.phone}`, "_blank")}
                      className="flex-1 rounded-xl text-xs"
                    >
                      <Phone className="w-3 h-3 mr-1" /> Chiama
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openWhatsApp(restaurant.name)}
                      className="flex-1 whatsapp-btn text-white rounded-xl text-xs"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" /> Prenota
                    </Button>
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
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
                className="flex overflow-hidden rounded-2xl bg-white border border-slate-100"
                data-testid={`restaurant-${restaurant.id}`}
              >
                <img 
                  src={restaurant.image_url} 
                  alt={restaurant.name}
                  className="w-28 h-28 object-cover"
                />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{restaurant.name}</h4>
                      <p className="text-xs text-amber-600 font-medium capitalize">
                        {restaurant.category}
                      </p>
                    </div>
                    {restaurant.is_recommended && (
                      <span className="badge-recommended text-xs">Top</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {restaurant.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`tel:${restaurant.phone}`, "_blank")}
                      className="text-slate-600 p-0 h-auto text-xs"
                    >
                      <Phone className="w-3 h-3 mr-1" /> Chiama
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openWhatsApp(restaurant.name)}
                      className="text-green-600 p-0 h-auto text-xs"
                      data-testid={`restaurant-book-${restaurant.id}`}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" /> Prenota
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {filteredRestaurants.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-slate-500">Nessun ristorante trovato</p>
        </div>
      )}
    </div>
  );
}
