import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Umbrella, Car, ChevronRight } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RentalsPage() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axios.get(`${API}/rentals`);
        setRentals(response.data);
      } catch (error) {
        console.error("Error fetching rentals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  const mareRentals = rentals.filter(r => r.category === "mare");
  const spostamentiRentals = rentals.filter(r => r.category === "spostamenti");

  const displayRentals = activeCategory === "all" ? rentals : 
    activeCategory === "mare" ? mareRentals : spostamentiRentals;

  return (
    <div className="px-5 py-6" data-testid="rentals-page">
      {/* Header */}
      <motion.div className="flex items-center gap-3 mb-6" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Button variant="ghost" size="icon" onClick={() => navigate("/guida")} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Noleggi</h1>
          <p className="text-slate-500 text-sm">Attrezzature per la tua vacanza</p>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div className="flex gap-2 mb-6" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        {[
          { id: "all", label: "Tutti", icon: null },
          { id: "mare", label: "Attrezzatura Mare", icon: Umbrella },
          { id: "spostamenti", label: "Spostamenti", icon: Car }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeCategory === cat.id 
                ? "bg-slate-900 text-white" 
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {cat.icon && <cat.icon className="w-4 h-4" />}
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Rentals Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Mare Section */}
          {(activeCategory === "all" || activeCategory === "mare") && mareRentals.length > 0 && (
            <motion.div className="mb-6" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
              {activeCategory === "all" && (
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Umbrella className="w-4 h-4" /> Attrezzatura Mare
                </h3>
              )}
              <div className="grid grid-cols-2 gap-3">
                {(activeCategory === "all" ? mareRentals : displayRentals).map((rental, index) => (
                  <motion.div
                    key={rental.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Card 
                      className="rounded-2xl overflow-hidden bg-white border border-slate-100 cursor-pointer interactive-card"
                      onClick={() => navigate(`/noleggi/${rental.id}`)}
                    >
                      <img src={rental.image_url} alt={rental.name} className="w-full h-24 object-cover" />
                      <div className="p-3">
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{rental.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-amber-600 font-bold text-sm">{rental.daily_price}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Spostamenti Section */}
          {(activeCategory === "all" || activeCategory === "spostamenti") && spostamentiRentals.length > 0 && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
              {activeCategory === "all" && (
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4" /> Spostamenti
                </h3>
              )}
              <div className="grid grid-cols-2 gap-3">
                {(activeCategory === "all" ? spostamentiRentals : displayRentals.filter(r => r.category === "spostamenti")).map((rental, index) => (
                  <motion.div
                    key={rental.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Card 
                      className="rounded-2xl overflow-hidden bg-white border border-slate-100 cursor-pointer interactive-card"
                      onClick={() => navigate(`/noleggi/${rental.id}`)}
                    >
                      <img src={rental.image_url} alt={rental.name} className="w-full h-24 object-cover" />
                      <div className="p-3">
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{rental.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-amber-600 font-bold text-sm">{rental.daily_price}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
