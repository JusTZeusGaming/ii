import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Bus, Car, MapIcon, Calendar, Users, Check } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoryIcons = {
  navette: Bus,
  ncc: Car,
  gite: MapIcon
};

const categoryLabels = {
  navette: "Navette",
  ncc: "NCC / Taxi",
  gite: "Gite Giornaliere"
};

export default function TransportPage() {
  const navigate = useNavigate();
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_phone: "",
    date: "",
    num_people: "",
    route: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransports = async () => {
      try {
        const response = await axios.get(`${API}/transports`);
        setTransports(response.data);
      } catch (error) {
        console.error("Error fetching transports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransports();
  }, []);

  // Group by category
  const groupedTransports = transports.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.guest_phone || !formData.date || !formData.num_people || !formData.route) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/transport-requests`, {
        ...formData,
        num_people: parseInt(formData.num_people)
      });
      toast.success("Richiesta inviata con successo! Ti contatteremo presto.");
      setIsDialogOpen(false);
      setFormData({ guest_name: "", guest_phone: "", date: "", num_people: "", route: "", notes: "" });
    } catch (error) {
      toast.error("Errore nell'invio della richiesta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-6" data-testid="transport-page">
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
          <h1 className="text-2xl font-bold text-slate-900">Senza auto</h1>
          <p className="text-slate-500 text-sm">Trasporti e navette</p>
        </div>
      </motion.div>

      {/* Request Transport Button */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-slate-900 text-white rounded-xl py-4 font-semibold"
          data-testid="request-transport-btn"
        >
          <Car className="w-5 h-5 mr-2" />
          Richiedi trasporto
        </Button>
      </motion.div>

      {/* Transports by Category */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransports).map(([category, items], categoryIndex) => {
            const Icon = categoryIcons[category] || Bus;
            return (
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
                  {items.map((transport) => (
                    <Card 
                      key={transport.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100"
                      data-testid={`transport-${transport.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{transport.name}</h4>
                          <p className="text-sm text-slate-500 mt-1">{transport.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-amber-600 font-semibold text-sm">
                              {transport.price_info}
                            </span>
                            <a 
                              href={`tel:${transport.contact_phone}`}
                              className="text-sm text-slate-600 hover:text-slate-900"
                            >
                              Chiama
                            </a>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Transport Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Richiedi trasporto
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="guest_name">Nome *</Label>
              <Input
                id="guest_name"
                value={formData.guest_name}
                onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                placeholder="Il tuo nome"
                className="rounded-xl"
                data-testid="transport-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest_phone">Telefono *</Label>
              <Input
                id="guest_phone"
                value={formData.guest_phone}
                onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                placeholder="+39 123 456 7890"
                className="rounded-xl"
                data-testid="transport-phone-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="rounded-xl"
                    data-testid="transport-date-input"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_people">Persone *</Label>
                <div className="relative">
                  <Input
                    id="num_people"
                    type="number"
                    min="1"
                    value={formData.num_people}
                    onChange={(e) => setFormData({...formData, num_people: e.target.value})}
                    placeholder="2"
                    className="rounded-xl"
                    data-testid="transport-people-input"
                  />
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="route">Tratta / Destinazione *</Label>
              <Input
                id="route"
                value={formData.route}
                onChange={(e) => setFormData({...formData, route: e.target.value})}
                placeholder="Es. Aeroporto Brindisi → Torre Lapillo"
                className="rounded-xl"
                data-testid="transport-route-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note (opzionale)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Es. Orario volo, numero bagagli..."
                className="rounded-xl resize-none"
                rows={3}
                data-testid="transport-notes-input"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold"
              data-testid="transport-submit-btn"
            >
              {isSubmitting ? "Invio in corso..." : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Invia richiesta
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
