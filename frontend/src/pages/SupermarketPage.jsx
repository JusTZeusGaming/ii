import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ShoppingCart,
  Phone,
  MapPin,
  Clock,
  Sandwich,
  ShoppingBag,
  Package,
  Apple,
  ExternalLink
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  sandwich: Sandwich,
  "shopping-bag": ShoppingBag,
  package: Package,
  apple: Apple
};

export default function SupermarketPage() {
  const navigate = useNavigate();
  const [supermarket, setSupermarket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/supermarket`);
        setSupermarket(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="px-5 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6" data-testid="supermarket-page">
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
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{supermarket?.name}</h1>
          <p className="text-slate-500 text-sm">Supermercato</p>
        </div>
      </motion.div>

      {/* Gallery */}
      <motion.div 
        className="mb-6 -mx-5"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex gap-2 overflow-x-auto px-5 no-scrollbar">
          {supermarket?.images?.map((img, idx) => (
            <img 
              key={idx}
              src={img}
              alt={`${supermarket.name} ${idx + 1}`}
              className="w-64 h-40 object-cover rounded-xl flex-shrink-0"
            />
          ))}
        </div>
      </motion.div>

      {/* Status Badge */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold">Aperto ora</span>
          <span className="text-green-600">• {supermarket?.distance}</span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-5 rounded-2xl bg-white border border-slate-100 mb-4">
          <p className="text-slate-600 leading-relaxed">{supermarket?.description}</p>
        </Card>
      </motion.div>

      {/* Quick Services */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Servizi Rapidi
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {supermarket?.services?.map((service) => {
            const Icon = iconMap[service.icon] || ShoppingBag;
            return (
              <Card key={service.name} className="p-4 rounded-xl bg-slate-50 border-0">
                <Icon className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-semibold text-slate-900 text-sm">{service.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{service.description}</p>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="p-5 rounded-2xl bg-white border border-slate-100 mb-4">
          <h3 className="font-semibold text-slate-900 mb-4">Informazioni</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">{supermarket?.address}</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-amber-600"
                  onClick={() => window.open(supermarket?.map_url, "_blank")}
                >
                  Apri in Google Maps <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <a href={`tel:${supermarket?.phone}`} className="font-medium text-slate-900 hover:text-amber-600">
                  {supermarket?.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-slate-900"><span className="font-medium">Lun-Ven:</span> {supermarket?.hours?.weekdays}</p>
                <p className="text-slate-900"><span className="font-medium">Sabato:</span> {supermarket?.hours?.saturday}</p>
                <p className="text-slate-900"><span className="font-medium">Domenica:</span> {supermarket?.hours?.sunday}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={() => window.open(supermarket?.map_url, "_blank")}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 font-semibold"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Portami qui
        </Button>
      </motion.div>
    </div>
  );
}
