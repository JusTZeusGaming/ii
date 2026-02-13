import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Star, ChevronRight, MessageCircle, Moon, Music } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const WHATSAPP_NUMBER = "393293236473";

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const categories = [
    { id: "all", label: t("activities.all") },
    { id: "barca", label: t("activities.boat") },
    { id: "escursioni", label: t("activities.excursions") },
    { id: "nightlife", label: t("activities.nightlife") },
    { id: "borghi", label: t("activities.villages") },
  ];

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get(`${API}/experiences`);
        setExperiences(response.data);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  const filteredExperiences = activeFilter === "all" 
    ? experiences 
    : experiences.filter(e => e.category === activeFilter);

  const topExperiences = experiences.filter(e => e.is_top);

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Ciao, vorrei un consiglio su cosa fare oggi")}`, "_blank");
  };

  return (
    <div className="px-5 py-6" data-testid="activities-page">
      {/* Header */}
      <motion.div className="flex items-center gap-3 mb-6" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Button variant="ghost" size="icon" onClick={() => navigate("/guida")} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("activities.title")}</h1>
          <p className="text-slate-500 text-sm">{t("activities.subtitle")}</p>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <motion.div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => cat.id === "nightlife" ? navigate("/nightlife") : setActiveFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === cat.id ? "bg-slate-900 text-white" : cat.id === "nightlife" ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {cat.id === "nightlife" && <Moon className="w-3 h-3 inline mr-1" />}
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Nightlife Banner */}
      {activeFilter === "all" && (
        <motion.div 
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card 
            className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 cursor-pointer interactive-card"
            onClick={() => navigate("/nightlife")}
            data-testid="nightlife-banner"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{t("activities.nightlifeBanner")}</h3>
                <p className="text-white/80 text-sm">{t("activities.nightlifeDesc")}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Top Experiences Carousel */}
      {activeFilter === "all" && topExperiences.length > 0 && (
        <motion.div className="mb-6" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t("activities.topExperiences")}</h3>
          <div className="horizontal-scroll">
            {topExperiences.map((exp) => (
              <Card 
                key={exp.id}
                className="w-72 flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-100 cursor-pointer interactive-card"
                onClick={() => navigate(`/attivita/${exp.id}`)}
              >
                <div className="relative h-40">
                  <img src={exp.image_url} alt={exp.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
                    <Star className="w-3 h-3 fill-current" /> Top
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h4 className="font-semibold text-white">{exp.name}</h4>
                    <p className="text-white/80 text-xs capitalize">{exp.category}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-500 line-clamp-2">{exp.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-amber-600 font-semibold text-sm">{exp.price_info}</span>
                    <span className="text-xs text-amber-600 font-medium">{t("details")} →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Experiences List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (<div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExperiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index + 0.2 }}
            >
              <Card 
                className="flex overflow-hidden rounded-2xl bg-white border border-slate-100 cursor-pointer interactive-card"
                onClick={() => navigate(`/attivita/${exp.id}`)}
              >
                <img src={exp.image_url} alt={exp.name} className="w-28 h-28 object-cover" />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{exp.name}</h4>
                      <p className="text-xs text-slate-400 capitalize">{exp.category}</p>
                    </div>
                    {exp.is_top && <span className="badge-recommended text-xs">Top</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{exp.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-amber-600 font-semibold text-xs">{exp.price_info}</span>
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      {t("book")} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <motion.div className="mt-6" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <Card className="p-5 rounded-2xl bg-slate-900 text-white">
          <h3 className="font-semibold text-lg mb-2">{t("activities.notFound")}</h3>
          <p className="text-slate-400 text-sm mb-4">{t("activities.notFoundDesc")}</p>
          <Button onClick={openWhatsApp} className="w-full whatsapp-btn text-white rounded-xl py-3 font-semibold">
            <MessageCircle className="w-5 h-5 mr-2" /> {t("activities.askAdvice")}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
